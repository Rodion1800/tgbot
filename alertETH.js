import { getETH } from "./request.js";

export async function comparePriceETH(requestedPrice, chatId, bot) {
  const currentPrice = await getETH();
  console.log(`Current price: ${currentPrice}`);

  if (requestedPrice > currentPrice) {
    console.log(
      `Requsted price (${requestedPrice}) bigger than (${currentPrice})`
    );
    await monitorPriceETH(requestedPrice, "above", chatId, bot);
  } else if (requestedPrice < currentPrice) {
    console.log(
      `Requsted price (${requestedPrice}) less than (${currentPrice})`
    );
    await monitorPriceETH(requestedPrice, "below", chatId, bot);
  } else {
    console.log(`Requsted price is equal to ${currentPrice}`);
  }
}

async function monitorPriceETH(requestedPrice, direction, chatId, bot) {
  const checkPrice = async () => {
    const currentPrice = await getETH();
    console.log(`Price now: ${currentPrice}`);

    if (direction === "above" && currentPrice >= requestedPrice) {
      const message = `Price reached: ${requestedPrice}, current price: ${currentPrice}`;
      console.log(message);
      bot.telegram.sendMessage(chatId, message);

      clearInterval(priceInterval);
    } else if (direction === "below" && currentPrice <= requestedPrice) {
      const message = `Price reached: ${requestedPrice}, current price: ${currentPrice}`;
      console.log(message);
      bot.telegram.sendMessage(chatId, message);
      clearInterval(priceInterval);
    } else {
      console.log(
        `Requsted price ${requestedPrice} not reached yet. Current price: ${currentPrice}`
      );
    }
  };

  const priceInterval = setInterval(checkPrice, 10000);
  await checkPrice();
}

export function cancelPriceAlert() {
  if (priceInterval) {
    clearInterval(priceInterval);
    ctx.reply("Price alert has been canceled.");
    priceInterval = null;
  } else {
    ctx.reply("No active price alert to cancel.");
  }
}
