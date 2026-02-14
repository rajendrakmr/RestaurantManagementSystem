const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  role: { type: String, enum: ["admin", "superadmin", "staff"], default: "staff" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Employee", employeeSchema);
