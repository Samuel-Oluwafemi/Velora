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

    const { reference, expectedAmount } = body;

    // Check if reference and expectedAmount are provided
    if (!reference || !expectedAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Reference and expected amount are required.",
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

    const expectedAmountInKobo = Math.round(Number(expectedAmount) * 100);

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

    // Verify the payment amount
    if (transaction.amount !== expectedAmountInKobo) {
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

    // Return successful verification response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully.",
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
