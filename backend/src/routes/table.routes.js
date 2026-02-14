const express = require("express");
const router = express.Router();
const tableController = require("../controllers/table.controller");

router.post("/", tableController.createTable);
router.get("/", tableController.getTables);

module.exports = router;
