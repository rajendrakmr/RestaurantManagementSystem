import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { apiRequest } from "@/store/services/api";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams } from "react-router-dom";
import "./Customer.css"; // custom CSS

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

const CustomerOrder: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [mobile, setMobile] = useState<string>("");
  const [showMobileModal, setShowMobileModal] = useState<boolean>(false);
  const [socket, setSocket] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");

  const [searchParams] = useSearchParams();
  const tableId = Number(searchParams.get("table"));

  // 🔹 INIT MOBILE & DEVICE ID
  useEffect(() => {
    const storedMobile = localStorage.getItem("mobile");
    if (storedMobile) setMobile(storedMobile);
    else setShowMobileModal(true);

    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  const saveMobile = () => {
    if (!mobile) return alert("Please enter a mobile number");
    localStorage.setItem("mobile", mobile);
    setShowMobileModal(false);
  };

  // 🔹 FETCH MENU & INIT SOCKET
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await apiRequest({ url: "/menu", method: "GET" });
        setMenu(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMenu();

    const socketIo = io("http://192.168.31.101:5000");
    setSocket(socketIo);
    return () => {socketIo.disconnect();}
  }, []);

  // 🔹 HANDLE QUANTITY
  const handleQuantityChange = (item: MenuItem, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter((o) => o.itemId !== item._id));
    } else {
      const existing = orderItems.find((o) => o.itemId === item._id);
      if (existing) {
        setOrderItems(
          orderItems.map((o) =>
            o.itemId === item._id ? { ...o, quantity } : o
          )
        );
      } else {
        setOrderItems([
          ...orderItems,
          { itemId: item._id, name: item.name, price: item.price, quantity },
        ]);
      }
    }
  };

  // 🔹 TOTAL PRICE
  const totalPrice = orderItems.reduce(
    (sum, o) => sum + o.price * o.quantity,
    0
  );

  // 🔹 SUBMIT ORDER
  const submitOrder = async () => {
    if (orderItems.length === 0) return alert("Select at least one item");

    const order = {
      tableId,
      deviceId,
      mobile: mobile || null,
      items: orderItems,
    };

    try {
      const res = await apiRequest({ url: "/orders", method: "POST", data: order });
      if (socket) socket.emit("order:created", res.order);
      alert("Order placed successfully!");
      setOrderItems([]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Table already in use");
    }
  };

  const categories = Array.from(new Set(menu.map((item) => item.category)));

  return (
    <div className="container py-3">
      {/* MOBILE NUMBER MODAL */}
      {showMobileModal && (
        <div className="modal fade show d-block mobile-modal-bg">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Enter Mobile Number</h5>
              </div>
              <div className="modal-body">
                <p className="text-muted">
                  We will not disclose your mobile number. Please feel safe & secure.
                </p>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={saveMobile}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENU */}
      <h4 className="mb-3 text-center">Table {tableId} - Place Your Order</h4>
      {categories.map((cat) => (
        <div key={cat} className="mb-4">
          <h5 className="category-title">{cat}</h5>
          <div className="row g-3">
            {menu
              .filter((item) => item.category === cat)
              .map((item) => {
                const orderItem = orderItems.find((o) => o.itemId === item._id);
                return (
                  <div key={item._id} className="col-12 col-sm-6 col-md-4">
                    <div className="card menu-card p-3 h-100 shadow-sm">
                      <h6 className="menu-item-name">{item.name}</h6>
                      <p className="text-muted small">{item.description}</p>
                      <strong>₹{item.price.toFixed(2)}</strong>
                      <input
                        type="number"
                        min={0}
                        className="form-control mt-2"
                        value={orderItem?.quantity || 0}
                        onChange={(e) =>
                          handleQuantityChange(item, parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* TOTAL & SUBMIT STICKY BOTTOM */}
      <div className="sticky-bottom bg-white p-3 shadow-lg order-summary d-flex justify-content-between align-items-center">
        <strong>Total: ₹{totalPrice.toFixed(2)}</strong>
        <button className="btn btn-primary btn-lg" onClick={submitOrder}>
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default CustomerOrder;
