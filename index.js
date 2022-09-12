const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const SHEET_ID = "1kgmnDpjB3nlKO2oUiBM-xCk_Ko2To-3qiqcEnNcXvvM";
const sk = JSON.parse(fs.readFileSync(path.join(__dirname, "sk.json")));

const getSheet = async () => {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: sk.client_email,
    private_key: sk.private_key,
  });
  await doc.loadInfo();
  const sheet = await doc.sheetsByIndex[0];
  return sheet;
};

const readSheet = async () => {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  return rows;
};
const getWebsiteCategory = async (url) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    if (html?.includes("window.Shopify")) {
      return "SHOPIFY";
    } else if (html?.includes("window.wc")) {
      return "WOOCOMMERCE";
    } else if (html?.includes("window.magento")) {
      return "MAGENTO";
    } else if (html?.includes("window.BigCommerce")) {
      return "BIGCOMMERCE";
    } else {
      return "OTHERS";
    }
  } catch (err) {
    return "NOT_WORKING";
  }
};
const setCategory = async () => {
  const rows = await readSheet();
  rows.forEach(async (row) => {
    if (row.Website) {
      row.Category = await getWebsiteCategory(row.Website);
      await row.save();
    }
  });
};
setCategory();
