import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../app/firebase";
import { CartItem } from "../app/components/store";

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

    status: "pending",
    paymentStatus: "pending",

    createdAt: serverTimestamp(),
  });

  return orderRef.id;
}