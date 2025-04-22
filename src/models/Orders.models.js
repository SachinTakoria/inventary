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
                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                },
                discount:{
                    type:Number,
                    default:0
                },
                totalPrice: {
                    type: Number,
                    required: true
                },
                hsn: String,
                _id: {
                    type: mongoose.Schema.Types.ObjectId
                }
            }
        ]
    },
    invoiceNumber: {
        type: String,
        unique: true, // keep this
        required: true, // make this false or remove
      },
      consignee: {
        name: { type: String },
        address: { type: String },
        gstin: { type: String },
        pan: { type: String },
        state: { type: String },
      },
      
    firm: {
        type: String,
        enum: ["devjyoti", "himanshi"],
        default: "devjyoti"
      },

    // ✅ New Payment-Related Fields
    amountPaid: {
        type: Number,
        default: 0,
    },
    oldPendingAdjusted: {
        type: Number,
        default: 0,
    },
    carryForward: {
        type: Number,
        default: 0,
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
   
      discount:{
        type:Number,
        default:0
      },
    totalAmountWithGST: {
        type: Number
    },

    // ✅ Additional Customer Details
    customerName: {
        type: String,
        trim: true
    },
    customerAddress: {
        type: String,
        trim: true
    },
    customerGST: {
        type: String,
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true
      }
      ,
      customerState: {
        type: String,
        trim: true
    },

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
