const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  tableId: {
    type: Number,
    required: true
  },

  deviceId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    unique: true
  }, 
  mobile: {
    type: String,
    required: false
  },

  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  total: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "completed",
      "cancelled"
    ],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
