import {
  addDoc,
  getDocs,
  query,
  where,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../app/firebase";
import { CartItem } from "../app/components/store";

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

interface CreateOrderData {
  userId: string;
  email: string;

  customer: {
    firstName: string;
    lastName: string;
  };

  items: CartItem[];

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
}

// Create the payment reference-writing function
export async function createPaymentReference(data: {
  reference: string;
  userId: string;
  amount: number;
}) {
  await setDoc(doc(db, "paymentReferences", data.reference), {
    userId: data.userId,
    amount: data.amount,
    currency: "NGN",
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// Create the order-writing function
export async function createOrder(orderData: CreateOrderData) {
  const orderRef = await addDoc(collection(db, "orders"), {
    userId: orderData.userId,
    email: orderData.email,

    customer: orderData.customer,

    items: orderData.items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      image: item.product.images[0],
    })),

    shippingAddress: orderData.shippingAddress,

    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    total: orderData.total,

    payment: orderData.payment,

    status: "pending",
    paymentStatus: "paid",

    createdAt: serverTimestamp(),
  });

  return orderRef.id;
}

// Create the order-reading function
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
