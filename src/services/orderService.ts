import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../app/firebase";

export interface Order {
  id: string;

  userId: string;

  email: string;

  customer: {
    firstName: string;
    lastName: string;
  };

  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
  }[];

  shippingAddress: {
    address: string;
    city: string;
    postcode: string;
    country: string;
  };

  subtotal: number;
  shipping: number;
  total: number;

  payment: {
    reference: string;
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
    channel: string;
  };

  status: string;
  paymentStatus: string;

  createdAt: unknown;
}

// Get the authenticated user's orders
export async function getUserOrders(userId: string) {
  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(collection(db, "orders"));

  return snapshot.docs.map((orderDocument) => ({
    id: orderDocument.id,
    ...orderDocument.data(),
  })) as Order[];
}
