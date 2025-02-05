export let historyPull = [];
let now = new Date();

export function getHistory(bot, chatId) {
  if (historyPull.length > 0) {
    historyPull.forEach((item) => {
      if (item.chatId === chatId) {
        const message = `Your history: 
      Token: ${item.itemSymbol} 
      Requsted Price: ${item.itemPrice} USDT 
      Created time(UTC): ${item.time}`;
        bot.telegram.sendMessage(chatId, message);
      }
    });
  } else {
    const message = `History pull is empty`;
    bot.telegram.sendMessage(chatId, message);
  }
}
