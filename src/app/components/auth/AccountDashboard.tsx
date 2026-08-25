import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserOrders, type Order } from "../../../services/orderService";

export default function AccountDashboard() {
  const { user, logout } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [name, setName] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  //
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || null);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    }

    void loadProfile();
  }, [user]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);
        setOrdersError(null);

        const userOrders = await getUserOrders(user.uid);

        setOrders(userOrders as Order[]);
      } catch (error) {
        console.error("Failed to load orders:", error);

        setOrdersError("We couldn't load your orders. Please try again.");
      } finally {
        setOrdersLoading(false);
      }
    }

    void loadOrders();
  }, [user]);

  return (
    <div className="text-center">
      {loadingProfile ? (
        <div className="flex items-center justify-center mb-6">
          <Loader size={18} className="animate-spin" />
        </div>
      ) : (
        <>
          <h2
            className="text-foreground mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.7rem",
              fontWeight: 300,
            }}
          >
            Welcome back{name ? `, ${name}` : ""}.
          </h2>

          <p
            className="text-muted-foreground mb-6"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
            }}
          >
            {user?.email}
          </p>
        </>
      )}

      {/* My Orders */}
      <div className="mt-10 text-left">
        <h2
          className="text-foreground mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            fontWeight: 400,
          }}
        >
          My Orders
        </h2>

        {ordersLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader size={18} className="animate-spin" />
          </div>
        )}

        {ordersError && (
          <div
            className="p-4 border border-red-200 bg-red-50 text-red-700"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
            }}
          >
            {ordersError}
          </div>
        )}

        {!ordersLoading && !ordersError && orders.length === 0 && (
          <div className="py-8 border border-border text-center">
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8rem",
              }}
            >
              You haven't placed any orders yet.
            </p>
          </div>
        )}

        {!ordersLoading && !ordersError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-muted-foreground uppercase tracking-[0.12em] mb-1"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.6rem",
                      }}
                    >
                      Order Number
                    </p>

                    <p
                      className="text-foreground"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.8rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      #{order.id}
                    </p>
                  </div>

                  <span
                    className="px-3 py-1 bg-secondary text-foreground uppercase"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.75rem",
                    }}
                  >
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </p>

                  <p
                    className="text-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.8rem",
                    }}
                  >
                    €{order.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => void logout()}
        className="mt-8 px-4 py-2 bg-foreground text-primary-foreground cursor-pointer
        hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        transition duration-200"
      >
        Logout
      </button>
    </div>
  );
}
