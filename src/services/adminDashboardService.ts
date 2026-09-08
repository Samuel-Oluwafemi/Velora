import { getIdToken } from "firebase/auth";
import { auth } from "../app/firebase";
import type { Order } from "./orderService";

export interface AdminCustomer {
  id: string;
  name?: string;
  email?: string;
  createdAt?: unknown;
  joined?: unknown;
  role?: string;
}

interface AdminDashboardResponse {
  success: boolean;
  message?: string;
  orders?: Order[];
  customers?: AdminCustomer[];
}

export async function getAdminDashboardData(): Promise<{
  orders: Order[];
  customers: AdminCustomer[];
}> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Authentication required.");
  }

  const idToken = await getIdToken(currentUser);
  const response = await fetch("/.netlify/functions/admin-get-dashboard-data", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json()) as AdminDashboardResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to load admin dashboard data.");
  }

  return {
    orders: data.orders ?? [],
    customers: data.customers ?? [],
  };
}
