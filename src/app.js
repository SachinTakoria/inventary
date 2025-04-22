const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ApiError = require("./utils/ApiError");
const ErrorHandling = require("./middlewares/ErrorHandler");
const path = require("path"); // ✅ Add this

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://djtextile.in"],
    credentials: true,
}));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

// ✅ Serve image folder
app.use("/uploads", express.static("uploads"));

// ✅ Serve invoice PDFs folder
app.use("/invoices", express.static(path.join(__dirname, "public/invoices"))); // ✅ Add this line

// ✅ Routes
app.use("/api/v1", require("./routes"));

// ✅ 404 + Error handler
app.use("*", (req, res) => {
    throw new ApiError(404, "Page not found");
});
app.use(ErrorHandling);

module.exports = app;
