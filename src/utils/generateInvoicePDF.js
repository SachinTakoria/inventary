const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = async (invoiceNumber) => {
  const invoiceUrl = `https://djtextile.in/invoice-view/${invoiceNumber}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(invoiceUrl, { waitUntil: "networkidle0" });

  const pdfDir = path.join(__dirname, "../public/invoices");
  const pdfPath = path.join(pdfDir, `${invoiceNumber}.pdf`);

  fs.mkdirSync(pdfDir, { recursive: true });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return `/invoices/${invoiceNumber}.pdf`;
};

module.exports = generateInvoicePDF;
