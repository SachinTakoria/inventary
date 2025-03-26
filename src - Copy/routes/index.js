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
    }
];

routes.forEach((cur) => {
    router.use(cur.path, cur.route); // ✅ Corrected
});

module.exports = router;
