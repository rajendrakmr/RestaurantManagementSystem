import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { apiRequest } from "@/store/services/api";
import notificationSoundFile from "@/notification.mp3";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  tableId: number;
  orderId: number;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  note?: string;
}

const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [newOrderPopup, setNewOrderPopup] = useState<Order | null>(null);
  const [updatePopup, setUpdatePopup] = useState<any>(null);

  // ✅ FETCH ORDERS
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiRequest({
          url: "/orders",
          method: "GET",
        });

        const data = res?.data || res;
        setOrders(data || []);
      } catch (err) {
        console.error("Fetch Orders Error:", err);
      }
    };

    fetchOrders();
  }, []);


  // ✅ SOCKET SETUP
  useEffect(() => {
    const socket: Socket = io("http://192.168.31.101:5000", {
      transports: ["websocket"],
    });

    // 🆕 NEW ORDER
    socket.on("order:created", (order: Order) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id);
        if (exists) return prev;
        return [order, ...prev];
      });

      playSound();

      if (order.status === "pending") {
        setNewOrderPopup(order);
      }
    });

    // 🔄 STATUS UPDATE
    socket.on("order:updated", (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id ? updatedOrder : o
        )
      );
    });

    // 🆕 ITEM ADDED / QUANTITY UPDATED
    socket.on("order:itemAdded", (data: any) => {
      const { orderId, type, item } = data;

      setOrders((prev) =>
        prev.map((order) => {
          if (order._id === orderId) {
            const updatedItems = [...order.items];
            const index = updatedItems.findIndex(
              (i) => i.name === item.name
            );

            if (index !== -1) {
              updatedItems[index] = item;
            } else {
              updatedItems.push(item);
            }

            return {
              ...order,
              items: updatedItems,
              total: updatedItems.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0
              ),
            };
          }
          return order;
        })
      );

      playSound();

      setUpdatePopup({
        type,
        item,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 🔔 SOUND FUNCTION
  // const playSound = () => {
  //   try {
  //     const audio = new Audio("/notification.mp3");
  //     audio.play().catch(() => { });
  //   } catch { }
  // };

  // ✅ UPDATE STATUS
  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await apiRequest({
        url: `/orders/${orderId}/status`,
        method: "PUT",
        data: { status },
      });

      const updated = res?.data?.order || res?.order || null;

      if (updated) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === updated._id ? updated : o
          )
        );
      }
    } catch (err) {
      console.error("Update Status Error:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "accepted":
        return "primary";
      case "preparing":
        return "info";
      case "ready":
        return "success";
      case "completed":
        return "dark";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(date).getTime()) / 60000
    );
    return diff <= 0 ? "Just now" : `${diff} min ago`;
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playSound = () => { audioRef.current?.play().catch(console.log); };
  return (
    <div className="container-fluid">
      <h3 className="mb-2 fw-bold">🔥 Live Kitchen Orders</h3>
      <audio ref={audioRef} src={notificationSoundFile} preload="auto" /> 
      <div className="mb-4 d-flex gap-2 flex-wrap">
        {[
          "all",
          "pending",
          "accepted",
          "preparing",
          "ready",
          "completed",
        ].map((tab) => (
          <button
            key={tab}
            className={`btn custom-form-control ${filter === tab
              ? "btn-dark"
              : "btn-outline-dark"
              }`}
            onClick={() => setFilter(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ORDERS */}
      <div className="row g-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="col-md-4">
            <div className="card shadow border-0 h-100">
              <div className="card-header d-flex justify-content-between">
                <div>
                  <div className="text-muted small">
                    Order ID: #{order.orderId} 
                  </div>
                </div>
                <span
                  className={`badge bg-${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="card-body">
                <strong>Table No: #{order.tableId}</strong>
                <br />
                <strong>Order ID: #{order.orderId}</strong>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex justify-content-between"
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <hr />
                <h6>Total: ₹{order.total}</h6>
                 <p>{getTimeAgo(order.createdAt)}</p>

                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {order.status === "pending" && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          updateStatus(order._id, "accepted")
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          updateStatus(order._id, "cancelled")
                        }
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {order.status === "accepted" && (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() =>
                        updateStatus(order._id, "preparing")
                      }
                    >
                      Preparing
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        updateStatus(order._id, "ready")
                      }
                    >
                      Ready
                    </button>
                  )}

                  {order.status === "ready" && (
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() =>
                        updateStatus(order._id, "completed")
                      }
                    >
                      Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🆕 NEW ORDER POPUP */}
      {newOrderPopup && (
        <Popup
          title="🔔 New Order"
          onClose={() => setNewOrderPopup(null)}
        >
          Table {newOrderPopup.tableId}
          <br />
          Total ₹{newOrderPopup.total}
        </Popup>
      )}

      {/* 🔄 ITEM UPDATE POPUP */}
      {updatePopup && (
        <Popup
          title={
            updatePopup.type === "new_item"
              ? "🆕 New Item Added"
              : "🔄 Quantity Updated"
          }
          onClose={() => setUpdatePopup(null)}
        >
          {updatePopup.item.name}
          <br />
          Qty: {updatePopup.item.quantity}
        </Popup>
      )}
    </div>
  );
};

// 🔥 Reusable Popup Component
const Popup = ({
  title,
  children,
  onClose,
}: any) => (
  <div
    className="modal fade show d-block"
    style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content shadow-lg">
        <div className="modal-header bg-warning">
          <h5 className="modal-title">{title}</h5>
        </div>
        <div className="modal-body text-center">
          {children}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-dark"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OrdersDashboard;
