import React, { useState } from "react";
import { toast } from "react-toastify";
import { apiRequest } from "@/store/services/api";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface PaymentModalProps {
  orderId: string;
  items: OrderItem[];
  gstPercent?: number;
  onClose: () => void;
  onPaymentSuccess?: (updatedOrder: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  orderId,
  items,
  gstPercent = 5, // default GST 5%
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");

  // Calculate totals
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gstAmount = parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
  const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method!");
      return;
    }
    try {
      const res = await apiRequest({
        url: `/orders/${orderId}/payment`,
        method: "POST",
        data: { method: selectedPaymentMethod },
      });
      const updated = res?.data?.order || null;
      if (updated && onPaymentSuccess) onPaymentSuccess(updated);
      toast.success(`Payment successful via ${selectedPaymentMethod}`);
      onClose();
      setSelectedPaymentMethod("");
    } catch (err) {
      console.error("Payment Error:", err);
      toast.error("Payment failed. Try again.");
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg rounded-4">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Billing Details</h5>
          </div>

          {/* Body */}
          <div className="modal-body">
            <table className="table table-borderless mb-3">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>GST ({gstPercent}%):</span>
              <span>₹{gstAmount}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total:</span>
              <span>₹{totalAmount}</span>
            </div>

            <hr />

            <h6 className="mt-3 mb-2 text-center">Select Payment Method</h6>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {["Cash", "Online", "Card (POS)"].map((method) => (
                <button
                  key={method}
                  className={`btn ${selectedPaymentMethod === method ? "btn-success" : "btn-outline-primary"}`}
                  onClick={() => setSelectedPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-dark" onClick={handlePayment}>
              Pay ₹{totalAmount}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
