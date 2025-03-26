require("dotenv").config({});
const { PUBLIC_DATA } = require("./constant");
const app = require("./src/app");
const { ConnectDB } = require("./src/config/db.config");

// ✅ Database Connect
ConnectDB();

// ✅ Uncaught Errors Handle Karne ke liye
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
});

// ✅ Server Start
app.listen(PUBLIC_DATA.port, () => {
    console.log(`✅ Server Running at http://localhost:${PUBLIC_DATA.port}`);
});
