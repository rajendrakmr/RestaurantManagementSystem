const Order = require("../models/order.model");
const Table = require("../models/table.model");
const crypto = require("crypto");

/* ===============================
   HELPERS
================================= */

const generateDeviceId = () =>
  crypto.randomBytes(8).toString("hex");

const generateOrderId = async () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  const datePart = `${mm}${dd}${yyyy}`;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const count = await Order.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const sequence = String(count + 1).padStart(4, "0");

  return `order-${datePart}-${sequence}`;
};

/* ===============================
   CREATE / UPDATE ORDER
================================= */

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, mobile } = req.body;

    if (!tableId || !items || items.length === 0) {
      return res.status(422).json({
        message: "Table and items are required",
      });
    }

    let deviceId = req.body.deviceId || generateDeviceId();

    const table = await Table.findOne({
      tableNumber: tableId,
    });

    if (!table) {
      return res.status(422).json({
        message: "Table not found",
      });
    }

    // 🚫 TABLE LOCK CHECK
    if (
      table.isOccupied &&
      table.activeDeviceId &&
      table.activeDeviceId !== deviceId
    ) {
      return res.status(422).json({
        message: "Table already in use",
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let existingOrder = await Order.findOne({
      tableId,
      deviceId,
      mobile: mobile || null,
      status: { $nin: ["completed", "cancelled"] },
      createdAt: { $gte: todayStart },
    });

    /* ===============================
       UPDATE EXISTING ORDER
    ================================= */

    if (existingOrder) {
      for (let newItem of items) {
        const found = existingOrder.items.find(
          (i) => i.name === newItem.name
        );

        if (found) {
          found.quantity += newItem.quantity;

          // 🔄 EMIT QUANTITY UPDATE
          global.io.emit("order:itemAdded", {
            orderId: existingOrder._id,
            type: "quantity_update",
            item: found,
          });
        } else {
          existingOrder.items.push(newItem);

          // 🆕 EMIT NEW ITEM
          global.io.emit("order:itemAdded", {
            orderId: existingOrder._id,
            type: "new_item",
            item: newItem,
          });
        }
      }

      existingOrder.total = existingOrder.items.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );

      await existingOrder.save();

      global.io.emit(
        "order:updated",
        existingOrder
      );

      return res.status(200).json({
        message: "Order updated",
        order: existingOrder,
      });
    }

    /* ===============================
       CREATE NEW ORDER
    ================================= */

    const total = items.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );

    const orderId = await generateOrderId();

    const newOrder = await Order.create({
      tableId,
      orderId,
      deviceId,
      mobile: mobile || null,
      items,
      total,
    });

    // 🔒 LOCK TABLE
    table.isOccupied = true;
    table.activeDeviceId = deviceId;
    await table.save();

    global.io.emit("order:created", newOrder);

    return res.status(201).json({
      message: "New order created",
      order: newOrder,
      deviceId,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
   UPDATE ORDER STATUS
================================= */

exports.updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    global.io.emit("order:updated", order);

    return res.json({
      message: "Status updated",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
   COMPLETE ORDER
================================= */

exports.completeOrder = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = "completed";
    await order.save();

    const table = await Table.findOne({
      tableNumber: order.tableId,
    });

    if (table) {
      table.isOccupied = false;
      table.activeDeviceId = null;
      await table.save();
    }

    global.io.emit("order:updated", order);

    return res.json({
      message:
        "Order completed & table released",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
   GET ALL ORDERS
================================= */

exports.getOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ===============================
   GET ACTIVE ORDERS
================================= */

exports.getActiveOrders =
  async (req, res) => {
    try {
      const orders = await Order.find({
        status: {
          $nin: ["completed", "cancelled"],
        },
      }).sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };


  exports.getOrderHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      from,
      to,
      tableId,
      mobile,
      status,
    } = req.query;

    const query = {};

    // 📅 Date Filter
    if (from || to) {
      query.createdAt = {};

      if (from) {
        query.createdAt.$gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // 🪑 Table Filter
    if (tableId) {
      query.tableId = Number(tableId);
    }

    // 📱 Mobile Filter
    if (mobile) {
      query.mobile = mobile;
    }

    // 📌 Status Filter
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const totalRecords = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      data: orders,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

