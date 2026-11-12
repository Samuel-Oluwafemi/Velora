import { getIdToken } from "firebase/auth";
import { auth } from "../app/firebase";

interface UpdateOrderResponse {
  success: boolean;
  status?: string;
  paymentStatus?: string;
  message?: string;
}

async function updateOrder(
  payload: Record<string, string>,
): Promise<UpdateOrderResponse> {
  const user = auth.currentUser;
  if (!user) throw new Error("Admin authentication required.");

  const response = await fetch("/.netlify/functions/admin-update-order", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getIdToken(user)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as UpdateOrderResponse;
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to update order.");
  }
  return data;
}

export async function setOrderStatus(orderId: string, status: string) {
  return updateOrder({ action: "set-order-status", orderId, status });
}

export async function syncPaymentStatus(orderId: string) {
  return updateOrder({ action: "sync-payment", orderId });
}
