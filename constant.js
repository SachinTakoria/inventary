require("dotenv").config(); // ✅ Yeh line already hai

// console.log("👉 MONGO_URI =", process.env.MONGO_URI); // ✅ Yeh line add karo

class PUBLIC_DATA {
    static port = process.env.PORT || 4000;
    static mongo_uri = process.env.MONGO_URI || `mongodb://localhost/inventry`;
    static jwt_auth = process.env.JWT_AUTH || "@#$%^&*(@#$%^&*($%^))#$%^&";
}

module.exports = {
    PUBLIC_DATA,
};
