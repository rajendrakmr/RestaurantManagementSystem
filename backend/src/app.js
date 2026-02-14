const express = require("express");
const cors = require("cors");

const tableRoutes = require("./routes/table.routes");
const orderRoutes = require("./routes/order.routes");
const employeeRoutes = require("./routes/employee.routes");

const app = express();

app.use(cors());
app.use(express.json());
const menuRoutes = require("./routes/menu.routes");

app.use("/api/employees", employeeRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);

module.exports = app;
