import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    : getApps()[0];

const adminDb = getFirestore(firebaseApp);
const adminAuth = getAuth(firebaseApp);

// Verify Paystack Payment
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
    const body = await req.json();

    // Check for Authorization header
    const authHeader = req.headers.get("Authorization");

    // Check if the Authorization header is present and starts with "Bearer "
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Authentication required.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Extract the ID token from the Authorization header
    const idToken = authHeader.split("Bearer ")[1];

    let decodedToken;

    // Verify the Firebase ID token from the Authorization header
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid authentication token.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get the authenticated user's ID from the decoded Firebase token
    const authenticatedUserId = decodedToken.uid;

    // Check if the authenticated user ID matches the user ID in the request body
    const { reference } = body;
    if (
      typeof reference !== "string" ||
      reference.length > 120 ||
      !/^[A-Za-z0-9_-]+$/.test(reference)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "A valid payment reference is required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Check if the secret key is available
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

    // Verify the payment with Paystack
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

    // Check if the response is OK and the status is true
    if (!response.ok || !data.status) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unable to verify payment with Paystack.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const transaction = data.data;

    // Find the payment reference created before Paystack checkout
    const paymentReferenceRef = adminDb
      .collection("paymentReferences")
      .doc(reference);

    const paymentReferenceDoc = await paymentReferenceRef.get();

    if (!paymentReferenceDoc.exists) {
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

    // Verify the payment reference data against the transaction data
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

    // Verify that the payment reference belongs to the authenticated user
    if (paymentReference.userId !== authenticatedUserId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "You are not authorized to process this payment.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Prevent the same payment reference from being verified more than once
    if (paymentReference.status === "verified") {
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

    // Verify the payment status
    if (transaction.status !== "success") {
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

    // Verify the payment currency
    if (transaction.currency !== "NGN") {
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

    // Verify amount against the trusted Firestore record
    if (transaction.amount !== paymentReference.amount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment amount does not match the expected amount.",
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
    if (!Array.isArray(paymentItems) || paymentItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment items are missing.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Product details are snapshotted when the payment reference is created.
    const productRefs = paymentItems.map((item: any) =>
      adminDb.collection("products").doc(item.productId),
    );

    const productDocs = await Promise.all(
      productRefs.map((ref: any) => ref.get()),
    );

    // Check that every product exists
    for (const productDoc of productDocs) {
      if (!productDoc.exists) {
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

    // Build order items using trusted Firestore product data
    const verifiedItems = paymentItems.map((item: any, index: number) => {
      const productData = productDocs[index].data();

      return {
        productId: productData.id || productDocs[index].id,
        name: item.name || productData.name,
        price: typeof item.price === "number" ? item.price : productData.price,
        image:
          item.image ||
          (Array.isArray(productData.images)
            ? productData.images[0] ?? ""
            : ""),
        quantity: item.quantity,
        size: item.size,
      };
    });

    // Calculate the subtotal using trusted Firestore prices
    const verifiedSubtotal = verifiedItems.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Calculate shipping on the server
    const verifiedShipping = verifiedSubtotal >= 50000 ? 0 : 3000;

    // Calculate the total on the server
    const verifiedTotal = verifiedSubtotal + verifiedShipping;

    // Verify that Paystack charged the server-calculated total
    if (transaction.amount !== verifiedTotal * 100) {
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
    const requestedByProduct = new Map<string, number>();
    for (const item of paymentItems) {
      requestedByProduct.set(
        item.productId,
        (requestedByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }
    const stockRefs = [...requestedByProduct.keys()].map((productId) =>
      adminDb.collection("products").doc(productId),
    );

    // Use a transaction to atomically verify the payment
    // and create the order.
    await adminDb.runTransaction(async (transactionRef) => {
      const paymentDoc = await transactionRef.get(paymentReferenceRef);
      const currentProductDocs = await Promise.all(
        stockRefs.map((ref) => transactionRef.get(ref)),
      );

      // Check if the payment reference still exists
      if (!paymentDoc.exists) {
        throw new Error("Payment reference not found.");
      }

      const paymentData = paymentDoc.data();

      if (!paymentData) {
        throw new Error("Payment reference data is missing.");
      }

      // If this payment has already been processed,
      // do not create another order.
      if (paymentData.status === "verified") {
        return;
      }

      if (paymentData.status !== "pending") {
        throw new Error("Invalid payment reference status.");
      }

      let inventoryAttention = false;
      for (let index = 0; index < currentProductDocs.length; index += 1) {
        const currentProduct = currentProductDocs[index];
        const currentData = currentProduct.data();
        const requestedQuantity =
          requestedByProduct.get(currentProduct.id) ?? 0;
        if (
          !currentData ||
          currentData.stockStatus === "outOfStock" ||
          currentData.inStock === false
        ) {
          inventoryAttention = true;
          continue;
        }
        if (
          currentData.stockStatus === "lowStock" &&
          (typeof currentData.stockQuantity !== "number" ||
            currentData.stockQuantity < requestedQuantity)
        ) {
          inventoryAttention = true;
        }
      }

      // Mark payment as verified and remember the order ID.
      transactionRef.update(paymentReferenceRef, {
        status: "verified",
        transactionId: transaction.id,
        verifiedAt: new Date(),
        orderId: orderRef.id,
      });

      for (let index = 0; index < currentProductDocs.length; index += 1) {
        const currentProduct = currentProductDocs[index];
        const currentData = currentProduct.data();
        if (currentData?.stockStatus !== "lowStock") continue;

        const remainingQuantity =
          typeof currentData.stockQuantity === "number"
            ? currentData.stockQuantity
            : 0;
        const available = Math.max(
          0,
          remainingQuantity -
            (requestedByProduct.get(currentProduct.id) ?? 0),
        );
        transactionRef.update(currentProduct.ref, {
          stockStatus: available === 0 ? "outOfStock" : "lowStock",
          stockQuantity: available,
          inStock: available > 0,
          updatedAt: new Date(),
        });
      }

      // Create the order.
      transactionRef.set(orderRef, {
        userId: authenticatedUserId,

        email: paymentReference.email,

        customer: paymentReference.customer,

        items: verifiedItems,

        shippingAddress: paymentReference.shippingAddress,

        subtotal: verifiedSubtotal,
        shipping: verifiedShipping,
        total: verifiedTotal,

        payment: {
          reference: transaction.reference,
          transactionId: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          channel: transaction.channel,
        },

        status: "pending",
        paymentStatus: "paid",
        inventoryStatus: inventoryAttention ? "attention" : "ok",

        createdAt: new Date(),
      });
    });

    // Return successful verification response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and order created successfully.",
        orderId: orderRef.id,
        transaction: {
          reference: transaction.reference,
          transactionId: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          channel: transaction.channel,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Paystack verification error:", error);

    // Return a generic error response for any unexpected errors
    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong while verifying the payment.",
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
