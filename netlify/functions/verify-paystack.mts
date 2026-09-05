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
    const {
      reference,
      email,
      customer,
      items,
      shippingAddress,
      subtotal,
      shipping,
      total,
    } = body;
    // Check if payment reference is provided
    if (
      !reference ||
      !email ||
      !customer ||
      !items ||
      !shippingAddress ||
      subtotal === undefined ||
      shipping === undefined ||
      total === undefined
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment and order information are required.",
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

    // Prevent the same payment reference from being verified more than once
    if (paymentReference.status === "verified") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "This payment has already been processed.",
        }),
        {
          status: 400,
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

    // Fetch the trusted product documents from Firestore
    const productRefs = items.map((item: any) =>
      adminDb.collection("products").doc(item.product.id),
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
    const verifiedItems = items.map((item: any, index: number) => {
      const productData = productDocs[index].data();

      return {
        productId: productData.id,
        name: productData.name,
        price: productData.price,
        quantity: item.quantity,
        size: item.size,
      };
    });

    const orderRef = adminDb.collection("orders").doc();

    // Use a transaction to ensure atomicity of the payment verification and order creation
    await adminDb.runTransaction(async (transactionRef) => {
      const paymentDoc = await transactionRef.get(paymentReferenceRef);

      // Check if the payment reference document exists
      if (!paymentDoc.exists) {
        throw new Error("Payment reference not found.");
      }

      const paymentData = paymentDoc.data();

      if (!paymentData) {
        throw new Error("Payment reference data is missing.");
      }

      if (paymentData.status !== "pending") {
        throw new Error("This payment has already been processed.");
      }

      // Mark payment as verified
      transactionRef.update(paymentReferenceRef, {
        status: "verified",
        transactionId: transaction.id,
        verifiedAt: new Date(),
      });

      // Create the order
      transactionRef.set(orderRef, {
        email,

        customer,

        items: verifiedItems,

        shippingAddress,

        subtotal,
        shipping,
        total,

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
