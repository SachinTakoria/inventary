const InvoiceCounter = require("../models/InvoiceCounter.model");

const getNextInvoiceNumber = async (firm) => {
  const prefix = firm === "himanshi" ? "HT" : "DJT";

  const counter = await InvoiceCounter.findOneAndUpdate(
    { firm },
    { $inc: { lastNumber: 1 } },
    { new: true, upsert: true }
  );

  const number = counter.lastNumber;
  const nextNumber = String(number).padStart(4, "0");


  return `${prefix}/${nextNumber}`;
};

module.exports = getNextInvoiceNumber;
