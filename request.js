import axios from "axios";

export let dataToken = [];

export async function getPrices() {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/ticker/24hr"
    );

    dataToken = [];

    response.data
      .filter(
        (item) =>
          item.symbol.includes("USDT") && item.lastPrice !== "0.00000000"
      )
      .forEach((item) => {
        dataToken.push({ symbol: item.symbol, lastPrice: item.lastPrice });
      });
  } catch (error) {
    console.error("Error fetching data:", error);
    return "error";
  }
}

export async function getPrice(coinSymbol) {
  let token = dataToken.find((item) => item.symbol === coinSymbol);
  return token.lastPrice;
}
setInterval(getPrices, 5000);
