import { getPrice, dataToken } from "./request.js";

let alertPull = [];

export async function setAlert(requestedPrice, coinSymbol, chatId, bot) {
  const currentPrice = await getPrice(coinSymbol);

  if (requestedPrice > currentPrice) {
    await monitorPrice(requestedPrice, coinSymbol, chatId, bot, "above");
  } else if (requestedPrice < currentPrice) {
    await monitorPrice(requestedPrice, coinSymbol, chatId, bot, "below");
  }
}

async function monitorPrice(
  requestedPrice,
  coinSymbol,
  chatId,
  bot,
  direction
) {
  const checkPrice = async () => {
    const currentPrice = await getPrice(coinSymbol);

    if (direction === "above" && currentPrice >= requestedPrice) {
      const message = `Price reached: ${requestedPrice}, current price: ${currentPrice}`;
      bot.telegram.sendMessage(chatId, message);

      clearInterval(priceInterval);
    } else if (direction === "below" && currentPrice <= requestedPrice) {
      const message = `Price reached: ${requestedPrice}, current price: ${currentPrice}`;
      bot.telegram.sendMessage(chatId, message);
      clearInterval(priceInterval);
    }
  };

  const priceInterval = setInterval(checkPrice, 5000);
  alertPull.push({ chatId, intervalId: priceInterval });
}
export function clearAlertInterval(chatId) {
  alertPull.forEach((item) => {
    if (item.chatId === chatId) {
      clearInterval(item.intervalId);
    }
  });

  alertPull = alertPull.filter((item) => item.chatId !== chatId);
}
