import { adminAuth, adminDb } from "./firebase-admin.mjs";

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
    // 1. Get Firebase ID token
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

    // 2. Verify Firebase ID token
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
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

    const adminUserId = decodedToken.uid;

    // 3. Check admin role
    const adminUserDoc = await adminDb
      .collection("users")
      .doc(adminUserId)
      .get();

    if (!adminUserDoc.exists) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Admin account not found.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const adminUserData = adminUserDoc.data();

    if (adminUserData?.role !== "admin") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Admin access denied.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 4. Get all orders
    const ordersSnapshot = await adminDb.collection("orders").get();

    const orders = ordersSnapshot.docs.map((orderDocument) => ({
      id: orderDocument.id,
      ...orderDocument.data(),
    }));

    // 5. Get all users
    const usersSnapshot = await adminDb.collection("users").get();

    const customers = usersSnapshot.docs
      .map(
        (
          userDocument,
        ): Record<string, unknown> & { id: string; role?: string } => ({
          id: userDocument.id,
          ...userDocument.data(),
        }),
      )
      .filter((user) => user.role !== "admin");

    // 6. Return dashboard data
    return new Response(
      JSON.stringify({
        success: true,
        orders,
        customers,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Admin dashboard data error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Unable to load admin dashboard data.",
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
