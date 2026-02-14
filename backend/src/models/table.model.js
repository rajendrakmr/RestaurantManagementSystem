const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    // tenantId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Tenant",
    //   required: true,
    //   index: true
    // },

    tableNumber: {
      type: Number,
      required: true
    },

    tableName: {
      type: String
    },

    capacity: {
      type: Number,
      default: 4
    },

    section: {
      type: String
    }, 
    status: {
      type: String,
      enum: ["N", "Y"],
      default: "Y"
    }, 
    qrCode: {
      type: String
    },
    isOccupied: {
      type: Boolean,
      default: false
    },
    activeDeviceId: {
      type: String,
      default: null
    }

  },
  { timestamps: true }
);

tableSchema.index(
  { tableNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Table", tableSchema);
