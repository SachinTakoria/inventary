const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ApiError = require("./utils/ApiError");
const ErrorHandling = require("./middlewares/ErrorHandler");

const app = express();

app.use(cors({
    origin: ["http://localhost:5173"  , "https://djis.netlify.app","http"], // ✅ Yahan apna frontend domain likh
    credentials: true, // Agar cookies ya auth bhejna ho toh
  }));
app.use(morgan("dev"));

// ✅ Fix: JSON Parser ke jagah form-data allow karo
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

// ✅ Serve Static Folder for Uploaded Images
app.use("/uploads", express.static("uploads")); // 🟢 This allows frontend to access images

// ✅ Routes
app.use("/api/v1", require("./routes"));

// ✅ Handle 404 Errors
app.use("*", (req, res) => {
    throw new ApiError(404, "Page not found");
});

// ✅ Error Handler Middleware
app.use(ErrorHandling);

module.exports = app;
