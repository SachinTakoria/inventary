const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consumer',
        required: true
    },
    items: {
        type: [
            {
                name: {
                    type: String,
                    trim: true
                },
                price: {
                    type: Number
                },
                quantity: { // ✅ NEW FIELD
                    type: Number,
                    required: true,
                    default: 1
                },
                totalPrice: { // ✅ NEW FIELD
                    type: Number,
                    required: true
                }
            }
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    withGST: {
        type: Boolean,
        default: false
    },
    gstRate: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    totalAmountWithGST: {
        type: Number
    }

}, { timestamps: true });

// ✅ Middleware to Calculate Total with GST
Schema.pre("save", function (next) {
    if (this.withGST) {
        this.totalAmountWithGST = this.totalAmount + (this.totalAmount * this.gstRate / 100);
    } else {
        this.totalAmountWithGST = this.totalAmount;
    }
    next();
});

const model = mongoose.model("Order", Schema);
module.exports = model;
