const express = require("express"); 
// const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.post("/", orderController.createOrder);
router.put("/:id/status", orderController.updateOrderStatus);
router.put("/:id/complete", orderController.completeOrder);
router.get("/", orderController.getOrders);
router.get("/active", orderController.getActiveOrders);
router.get("/history", orderController.getOrderHistory);

 
module.exports = router;
