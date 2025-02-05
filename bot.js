import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { getHistory } from "./history.js";
import { keyboard, removeKeyboard } from "telegraf/markup";
import { clearAlertInterval } from "./alert.js";
import { getInlinePrice } from "./inlineBot.js";
import { stages } from "./scenes.js";
import { session } from "telegraf/session";

export const bot = new Telegraf(config.telegramToken, {});

bot.use(session());
bot.use(stages.middleware());
bot.start((ctx) =>
  ctx.reply("Welcome! Please choose an option.", {
    reply_markup: {
      keyboard: [
        ["Get price"],
        ["Set Alert"],
        ["Cancel Alert"],
        ["Get History"],
        ["Close menu"],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  })
);

const closeMenu = (bot, chatId) => {
  bot.telegram.sendMessage(chatId, "Menu closed.", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
};

bot.hears("Close menu", (ctx) => {
  const chatId = ctx.chat.id;
  closeMenu(bot, chatId);
});

const cancelAlert = (bot, chatId) => {
  bot.telegram.sendMessage(chatId, "Alert canceled.");
  clearAlertInterval(chatId);
};
bot.hears("Cancel Alert", (ctx) => {
  const chatId = ctx.chat.id;
  cancelAlert(bot, chatId);
});

const checkHistory = (bot, chatId) => {
  getHistory(bot, chatId);
};
bot.hears("Get History", (ctx) => {
  const chatId = ctx.chat.id;
  checkHistory(bot, chatId);
});

bot.hears("Get price", (ctx) => ctx.scene.enter("getPrice"));
bot.hears("Set Alert", (ctx) => ctx.scene.enter("setAlert"));
bot.on("inline_query", getInlinePrice);

bot.launch();
