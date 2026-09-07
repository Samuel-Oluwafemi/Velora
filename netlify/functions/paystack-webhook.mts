import crypto from "node:crypto";
import { adminDb } from "../functions/firebase-admin.mjs";

// This function handles Paystack webhook events. It verifies the signature of incoming requests to ensure they are from Paystack, and processes the "charge.success" event for successful payments.
export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is missing.");

      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment configuration is missing.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Read the raw request body.
    const rawBody = await req.text();

    // Paystack sends its signature in this header.
    const paystackSignature = req.headers.get("x-paystack-signature");

    if (!paystackSignature) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing webhook signature.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Generate the signature we expect from Paystack.
    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    // Compare Paystack's signature with our generated signature.
    const receivedSignature = Buffer.from(paystackSignature);
    const generatedSignature = Buffer.from(expectedSignature);

    const signaturesMatch =
      receivedSignature.length === generatedSignature.length &&
      crypto.timingSafeEqual(receivedSignature, generatedSignature);

    if (!signaturesMatch) {
      console.error("Invalid Paystack webhook signature.");

      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid webhook signature.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Only parse the body after signature verification.
    const body = JSON.parse(rawBody);

    const event = body.event;
    const transaction = body.data;

    // Handle only the "charge.success" event for successful payments.
    if (event !== "charge.success") {
      console.log(`Ignoring Paystack event: ${event}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Event ignored.",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const reference = transaction?.reference;

    // If the reference is missing, log an error and return a 400 response.
    if (!reference) {
      console.error("Webhook transaction reference is missing.");

      return new Response(
        JSON.stringify({
          success: false,
          message: "Transaction reference is missing.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("Successful Paystack payment:", reference);

    const paymentReferenceRef = adminDb
      .collection("paymentReferences")
      .doc(reference);

    const paymentReferenceDoc = await paymentReferenceRef.get();

    if (!paymentReferenceDoc.exists) {
      console.error(`Payment reference not found: ${reference}`);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment reference not found.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const paymentReference = paymentReferenceDoc.data();

    if (!paymentReference) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment reference data is missing.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("Payment reference found:", reference);

    if (paymentReference.status === "verified") {
      console.log(`Payment already processed: ${reference}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment has already been processed.",
          orderId: paymentReference.orderId || null,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Verify the transaction directly with Paystack.
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Unable to verify transaction with Paystack:", data);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Unable to verify payment.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const verifiedTransaction = data.data;

    console.log(
      "Transaction verified with Paystack:",
      verifiedTransaction.reference,
    );

    // Validate payment status.
    if (verifiedTransaction.status !== "success") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment was not successful.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Validate payment currency.
    if (verifiedTransaction.currency !== paymentReference.currency) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid payment currency.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Validate payment amount.
    if (verifiedTransaction.amount !== paymentReference.amount) {
      console.error("Payment amount mismatch:", {
        expected: paymentReference.amount,
        received: verifiedTransaction.amount,
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment amount does not match.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const paymentItems = paymentReference.items;

    if (
      !paymentItems ||
      !Array.isArray(paymentItems) ||
      paymentItems.length === 0
    ) {
      console.error("Payment reference has no valid items.");

      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment items are missing.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const productRefs = paymentItems.map((item: any) =>
      adminDb.collection("products").doc(item.productId),
    );

    const productDocs = await Promise.all(
      productRefs.map((ref: any) => ref.get()),
    );

    for (const productDoc of productDocs) {
      if (!productDoc.exists) {
        console.error("One or more products could not be found.");

        return new Response(
          JSON.stringify({
            success: false,
            message: "One or more products could not be found.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    const verifiedItems = paymentItems.map((item: any, index: number) => {
      const productData = productDocs[index].data();

      return {
        productId: productData.id,
        name: productData.name,
        price: productData.price,
        quantity: item.quantity,
        size: item.size,
      };
    });

    const verifiedSubtotal = verifiedItems.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    const verifiedShipping = verifiedSubtotal >= 50000 ? 0 : 3000;

    const verifiedTotal = verifiedSubtotal + verifiedShipping;

    if (verifiedTransaction.amount !== verifiedTotal * 100) {
      console.error("Final order amount mismatch:", {
        expected: verifiedTotal * 100,
        received: verifiedTransaction.amount,
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment amount does not match the order total.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const orderRef = adminDb.collection("orders").doc(reference);

    await adminDb.runTransaction(async (transactionRef) => {
      const paymentDoc = await transactionRef.get(paymentReferenceRef);

      if (!paymentDoc.exists) {
        throw new Error("Payment reference not found.");
      }

      const paymentData = paymentDoc.data();

      if (!paymentData) {
        throw new Error("Payment reference data is missing.");
      }

      // Prevent duplicate order creation
      if (paymentData.status === "verified") {
        return;
      }

      if (paymentData.status !== "pending") {
        throw new Error("Invalid payment reference status.");
      }

      // Mark payment reference as verified
      transactionRef.update(paymentReferenceRef, {
        status: "verified",
        transactionId: verifiedTransaction.id,
        verifiedAt: new Date(),
        orderId: orderRef.id,
      });

      // Create the order
      transactionRef.set(orderRef, {
        userId: paymentData.userId,
        email: paymentData.email,
        customer: paymentData.customer,

        items: verifiedItems,

        shippingAddress: paymentData.shippingAddress,

        subtotal: verifiedSubtotal,
        shipping: verifiedShipping,
        total: verifiedTotal,

        payment: {
          reference: verifiedTransaction.reference,
          transactionId: verifiedTransaction.id,
          status: verifiedTransaction.status,

          amount: verifiedTransaction.amount,
          currency: verifiedTransaction.currency,
          channel: verifiedTransaction.channel,
        },

        status: "pending",
        paymentStatus: "paid",

        createdAt: new Date(),
      });
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and order created.",
        orderId: orderRef.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong while processing the webhook.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
