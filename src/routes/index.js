const router = require("express").Router();

const routes = [
    {
        path: '/auth',
        route: require("./Auth.route")
    },
    {
        path: '/consumer',
        route: require("./Consumer.route")
    },
    {
        path: '/orders',
        route: require("./Order.route")
    },
    {
        path: '/products',
        route: require("./Product.route")
    },
    {
        path: '/categories', // ✅ ADD THIS LINE
        route: require("./Category.route")
    },
    {
        path: '/invoices', // ✅ NEW: Invoices API
        route: require("./invoice.route")
    },
    {
        path: '/consignees',  // ✅ NEW: Consignee API added here
        route: require("./Consignee.route")
    },
    {
        path: '/purchases', // ✅ NEW: Purchase Tracking API
        route: require("./Purchase.route")
    },{
        path: '/purchase-invoice', // ✅ NEW: Purchase Invoice API
        route: require("./purchaseInvoice.route")
    }
];

routes.forEach((cur) => {
    router.use(cur.path, cur.route);
});

module.exports = router;
