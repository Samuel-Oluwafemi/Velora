import { adminAuth, adminDb } from "./firebase-admin.mjs";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function isAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  try {
    const user = await adminAuth.verifyIdToken(
      authHeader.slice("Bearer ".length),
    );
    const userDoc = await adminDb.collection("users").doc(user.uid).get();
    return userDoc.data()?.role === "admin";
  } catch {
    return false;
  }
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ success: false, message: "Method not allowed." }, 405);
  }

  try {
    if (!(await isAdmin(req))) {
      return jsonResponse(
        { success: false, message: "Admin authentication required." },
        403,
      );
    }

    const body = await req.json();
    if (
      typeof body.orderId !== "string" ||
      !body.orderId ||
      body.orderId.length > 200
    ) {
      return jsonResponse({ success: false, message: "Invalid order ID." }, 400);
    }

    const orderRef = adminDb.collection("orders").doc(body.orderId);
    const orderSnapshot = await orderRef.get();
    if (!orderSnapshot.exists) {
      return jsonResponse({ success: false, message: "Order not found." }, 404);
    }
    const order = orderSnapshot.data();
    if (!order) {
      return jsonResponse({ success: false, message: "Order data is missing." }, 404);
    }

    if (body.action === "set-order-status") {
      const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!allowedStatuses.includes(body.status)) {
        return jsonResponse(
          { success: false, message: "Invalid order status." },
          400,
        );
      }

      await orderRef.update({
        status: body.status,
        updatedAt: new Date(),
      });
      return jsonResponse({ success: true, status: body.status });
    }

    if (body.action !== "sync-payment") {
      return jsonResponse(
        { success: false, message: "Unsupported order action." },
        400,
      );
    }

    const reference = order.payment?.reference;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (typeof reference !== "string" || !reference) {
      return jsonResponse(
        { success: false, message: "This order has no Paystack reference." },
        400,
      );
    }
    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is missing.");
      return jsonResponse(
        { success: false, message: "Payment configuration is missing." },
        500,
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const result = await response.json();
    const transaction = result.data;
    if (!response.ok || !result.status || !transaction) {
      return jsonResponse(
        { success: false, message: "Paystack could not verify this payment." },
        502,
      );
    }
    if (
      transaction.reference !== reference ||
      transaction.currency !== (order.payment?.currency || "NGN") ||
      transaction.amount !== order.total * 100
    ) {
      return jsonResponse(
        {
          success: false,
          message: "Paystack payment details do not match this order.",
        },
        409,
      );
    }

    const providerStatus =
      typeof transaction.status === "string" ? transaction.status : "unknown";
    const paymentStatus =
      providerStatus === "success" ? "paid" : providerStatus;
    const paymentReferenceRef = adminDb
      .collection("paymentReferences")
      .doc(reference);

    await adminDb.runTransaction(async (transactionRef) => {
      const currentOrder = await transactionRef.get(orderRef);
      if (!currentOrder.exists) throw new Error("Order no longer exists.");

      transactionRef.update(orderRef, {
        paymentStatus,
        payment: {
          ...order.payment,
          reference,
          transactionId: transaction.id,
          status: providerStatus,
          amount: transaction.amount,
          currency: transaction.currency,
          channel: transaction.channel ?? order.payment?.channel ?? "",
          verifiedAt: new Date(),
        },
        updatedAt: new Date(),
      });

      if (paymentStatus === "paid") {
        transactionRef.set(
          paymentReferenceRef,
          {
            status: "verified",
            transactionId: transaction.id,
            verifiedAt: new Date(),
            orderId: orderRef.id,
          },
          { merge: true },
        );
      }
    });

    return jsonResponse({ success: true, paymentStatus });
  } catch (error) {
    console.error("Admin order update error:", error);
    return jsonResponse(
      { success: false, message: "Unable to update this order." },
      500,
    );
  }
};
