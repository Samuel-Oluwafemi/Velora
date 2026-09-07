import { adminDb, adminAuth } from "../functions/firebase-admin.mjs";

export default async (req: Request) => {
  // Only allow POST requests
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
    // Get Firebase ID token
    const authHeader = req.headers.get("Authorization");

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

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase user
    let decodedToken;

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

    const authenticatedUserId = decodedToken.uid;

    // Read request body
    const body = await req.json();

    const { items } = body;

    // Validate cart
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Cart items are required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get trusted products from Firestore
    const productRefs = items.map((item: any) =>
      adminDb.collection("products").doc(item.product.id),
    );

    const productDocs = await Promise.all(
      productRefs.map((ref: any) => ref.get()),
    );

    // Make sure every product exists
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

    // Calculate subtotal using Firestore prices
    const verifiedSubtotal = items.reduce(
      (sum: number, item: any, index: number) => {
        const productData = productDocs[index].data();

        return sum + productData.price * item.quantity;
      },
      0,
    );

    // Calculate shipping on the server
    const verifiedShipping = verifiedSubtotal >= 50000 ? 0 : 3000;

    // Calculate final total
    const verifiedTotal = verifiedSubtotal + verifiedShipping;

    // Generate payment reference
    const reference = `VELORA-${Date.now()}`;

    // Save payment reference
    await adminDb
      .collection("paymentReferences")
      .doc(reference)
      .set({
        userId: authenticatedUserId,
        amount: verifiedTotal * 100,
        currency: "NGN",
        status: "pending",
        createdAt: new Date(),
      });

    // Send reference + trusted amount back to frontend
    return new Response(
      JSON.stringify({
        success: true,
        reference,
        amount: verifiedTotal * 100,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Create payment reference error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong while creating the payment reference.",
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
