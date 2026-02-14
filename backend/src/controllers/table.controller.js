const Table = require("../models/table.model");
const QRCode = require("qrcode");
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, tableName, capacity, section } = req.body; 
    const errors = {};

    if (!tableNumber) errors.tableNumber = "Table number is required";

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }
    const existing = await Table.findOne({ tableNumber });  
    if (existing) {
      return res.status(422).json({ errors });
    }
    const orderUrl = `${process.env.FRONTEND_URL}/services?table=${tableNumber}`;
    const qrCode = await QRCode.toDataURL(orderUrl);

    const table = await Table.create({
      tableNumber,
      tableName,
      capacity,
      section,
      qrCode
    });
    res.status(200).json({
      message: "Table created successfully",
      table
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(422).json({
        errors: { tableNumber: "Duplicate table number" }
      });
    }


    res.status(500).json({
      errors: { general: err.message }
    });
  }
};



// 🔥 Get All Tables (Tenant Safe)
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({
      errors: { general: err.message }
    });
  }
};



// 🔥 Get Single Table
exports.getTableById = async (req, res) => {
  try {
    const tenantId = req.tenant._id;

    const table = await Table.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json(table);

  } catch (err) {
    res.status(500).json({
      errors: { general: err.message }
    });
  }
};



// 🔥 Update Table
exports.updateTable = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const { tableNumber, tableName, capacity, section, status } = req.body;

    const table = await Table.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // If tableNumber changed, check duplicate
    if (tableNumber && tableNumber !== table.tableNumber) {
      const duplicate = await Table.findOne({
        tenantId,
        tableNumber
      });

      if (duplicate) {
        return res.status(422).json({
          errors: { tableNumber: "Table number already exists" }
        });
      }

      // regenerate QR
      const orderUrl = `${process.env.FRONTEND_URL}/order/${req.tenant.slug}/${tableNumber}`;
      table.qrCode = await QRCode.toDataURL(orderUrl);
      table.tableNumber = tableNumber;
    }

    if (tableName !== undefined) table.tableName = tableName;
    if (capacity !== undefined) table.capacity = capacity;
    if (section !== undefined) table.section = section;
    if (status !== undefined) table.status = status;

    await table.save();

    res.json({ message: "Table updated successfully", table });

  } catch (err) {
    res.status(500).json({
      errors: { general: err.message }
    });
  }
};



// 🔥 Soft Delete Table
exports.deleteTable = async (req, res) => {
  try {
    const tenantId = req.tenant._id;

    const table = await Table.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    table.isDeleted = true;
    await table.save();

    res.json({ message: "Table deleted successfully" });

  } catch (err) {
    res.status(500).json({
      errors: { general: err.message }
    });
  }
};
