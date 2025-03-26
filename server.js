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

const PORT = PUBLIC_DATA.port || 8000;
const HOST = "0.0.0.0"; // ✅ Yeh line add karo

app.listen(PORT, HOST, () => {
    console.log(`✅ Server Running at http://${HOST}:${PORT}`);
});
