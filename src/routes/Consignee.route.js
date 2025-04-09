const express = require("express");
const router = express.Router();
const ConsigneeController = require("../controllers/Consignee.controller");
const Authentication = require("../middlewares/Authentication");

router.use(Authentication); // ✅ All routes protected

// POST /api/consignees
router.post("/", ConsigneeController.createConsignee);

// GET /api/consignees
router.get("/", ConsigneeController.getUserConsignees);

// DELETE /api/consignees/:id
router.delete("/:id", ConsigneeController.deleteConsignee);

// PUT /api/consignees/:id
router.put("/:id", ConsigneeController.updateConsignee);

module.exports = router;
