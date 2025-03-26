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
        path: '/invoices', // ✅ NEW: Invoices API
        route: require("./invoice.route")
    }
];

routes.forEach((cur) => {
    router.use(cur.path, cur.route);
});

module.exports = router;
