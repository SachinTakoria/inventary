const express = require("express")
const Authentication = require("../middlewares/Authentication"); 
const Validation = require("../middlewares/Validation");
const { CreateOrder } = require("../validations/Order.validation");
const OrdersController = require("../controllers/Order.controller");
const router = express.Router();

// ✅ All routes below require authentication
router.use(Authentication);

// ✅ Create a new order
router.route("/create-order")
  .post(CreateOrder, Validation, OrdersController.createOrder);

// ✅ Get paginated orders
router.route("/get-orders")
  .get(OrdersController.getAllorders);

// ✅ Get invoice data by ID
router.route("/get-invoice/:id")
  .get(OrdersController.getInvoiceById);

// ✅ Delete order by ID
router.route("/delete/:id")
  .delete(OrdersController.deleteOrder);

// ✅ Sales Statistics route (Today, Yesterday, Total Users, Total Orders)
router.route("/sales-stats")
  .get(OrdersController.getSalesStats);


  router.route("/") // ✅ This fixes the issue
  .get(OrdersController.getAllOrders);

  router.route("/invoice/:id").get(OrdersController.getInvoiceById);
  

module.exports = router;
