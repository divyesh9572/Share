require('dotenv').config()
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const csvtojson = require("csvtojson");
const app = express();
app.use(cors());

const port = process.env.PORT || 8080;
let jsonArray = [];
const tickers = ["^NSEI"];
async function fetchDataAndConvertToJSON(ticker, interval, startDate, endDate) {
  const startDateString = new Date(startDate);
  const endDateString = new Date(endDate);
  const period1 = Math.floor(startDateString.getTime() / 1000);
  const period2 = Math.floor(endDateString.getTime() / 1000) + 86399;
  const queryString = `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${period1}&period2=${period2}&interval=${interval}&events=history&includeAdjustedClose=true`;

  try {
    const response = await axios.get(queryString);
    jsonArray = await csvtojson().fromString(response.data);
    console.log(jsonArray);
  } catch (error) {
    console.error(`Error fetching data for ${ticker}: ${error.message}`);
  }
}
app.get("/api/fetchData/:apiOptions", async (req, res) => {
  const apiOptions = req.params.apiOptions;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let passDays;
  if (apiOptions == "monthly") {
    passDays = "1mo";
  }
  if (apiOptions == "weekly") {
    passDays = "1wk";
  }
  if (apiOptions == "daily") {
    passDays = "1d";
  }

  console.log(apiOptions);
  console.log(startDate);
  console.log(endDate);
  try {
    for (const ticker of tickers) {
      await fetchDataAndConvertToJSON(ticker, passDays, startDate, endDate);
    }
    res.json({ success: true, data: jsonArray, tickers });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error" });
  }
});

app.listen(port , () => {
  console.log(`Server is running at http://localhost:${port}`);
});
