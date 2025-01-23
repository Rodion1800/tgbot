import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { getBTC, getETH } from "./request.js";
import { keyboard, removeKeyboard } from "telegraf/markup";
import { comparePriceETH, cancelPriceAlert } from "./alertETH.js";
import { session } from "telegraf/session";
import { comparePriceBTC } from "./alertBTC.js";
const bot = new Telegraf(config.telegramToken, {});
bot.use(session());

const closeMenu = (bot, chatId) => {
  bot.telegram.sendMessage(chatId, "Menu closed.", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
};

bot.start((ctx) =>
  ctx.reply("Welcome! Please choose an option.", {
    reply_markup: {
      keyboard: [
        ["Get BTC price"],
        ["Get Eth price"],
        ["Set Alert for BTC"],
        ["Set Alert for ETH"],
        ["Cancel Alert"],
        ["Close menu"],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  })
);

bot.on("message", async (ctx) => {
  const chatId = ctx.chat.id;

  if (!ctx.session) {
    ctx.session = {};
  }

  if (!ctx.session.isSetAlert) {
    ctx.session.isSetAlert = false;
  }

  if (ctx.message.text === "Cancel Alert") {
    const cancelAlert = cancelPriceAlert();
    ctx.reply(`Alert is canceled${cancelAlert}`);
  }
  if (ctx.message.text === "Menu") {
    showMenu(bot, chatId);
  } else if (ctx.message.text === "Get BTC price") {
    const getBTCPrice = await getBTC();
    ctx.reply(`BTC Price: ${getBTCPrice}`);
  } else if (ctx.message.text === "Get Eth price") {
    const getETHPrice = await getETH();
    ctx.reply(`ETH Price: ${getETHPrice}`);
  } else if (ctx.message.text === "Set Alert for BTC") {
    ctx.reply("Please enter the price at which you want to set the alert.");
    ctx.session.isSetAlert = "BTC";
  } else if (ctx.session.isSetAlert === "BTC") {
    const price = parseFloat(ctx.message.text);
    if (isNaN(price)) {
      ctx.reply("Please enter a valid number for the price.");
    } else {
      ctx.session.targetPrice = price;
      ctx.reply(`Alert set for BTC price: ${price}`);
      ctx.session.isSetAlert = false;

      comparePriceBTC(price, chatId, bot);
    }
  } else if (ctx.message.text === "Set Alert for ETH") {
    ctx.reply("Please enter the price at which you want to set the alert.");
    ctx.session.isSetAlert = "ETH";
  } else if (ctx.session.isSetAlert === "ETH") {
    const price = parseFloat(ctx.message.text);
    if (isNaN(price)) {
      ctx.reply("Please enter a valid number for the price.");
    } else {
      ctx.session.targetPrice = price;
      ctx.reply(`Alert set for ETH price: ${price}`);
      ctx.session.isSetAlert = false;

      comparePriceETH(price, chatId, bot);
    }
  } else if (ctx.message.text === "Close menu") {
    closeMenu(bot, chatId);
  } else {
    ctx.reply("Invalid option. Please type 'Menu' to see the options.");
  }
});

// Запуск бота
bot.launch();
