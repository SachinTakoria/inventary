const { default: mongoose } = require("mongoose");
const { PUBLIC_DATA } = require("../../constant");

exports.ConnectDB = async () => {
  try {
    console.log("🔁 Trying to connect to MongoDB...");
    console.log("🔑 URI:", PUBLIC_DATA.mongo_uri);

    await mongoose.connect(PUBLIC_DATA.mongo_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // ✅ 10 sec timeout for fail-safe
    });

    console.log(`✅ MongoDB connected at ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};
