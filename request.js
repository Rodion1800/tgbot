import axios from "axios";

export async function getBTC() {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT"
    );
    return parseFloat(response.data.price);
  } catch (error) {
    return "error";
  }
}

export async function getETH() {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/avgPrice?symbol=ETHUSDT"
    );
    return parseFloat(response.data.price);
  } catch (error) {
    return "error";
  }
}
