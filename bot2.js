import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { keyboard, removeKeyboard } from "telegraf/markup";
import { setAlert, clearAlertInterval } from "./alertETH.js";
import { session } from "telegraf/session";
import { Scenes, Markup } from "telegraf";
import { getPrices, dataToken } from "./request.js";
const bot = new Telegraf(config.telegramToken, {});

const { WizardScene, Stage } = Scenes;
bot.use(session());

bot.start((ctx) =>
  ctx.reply("Welcome! Please choose an option.", {
    reply_markup: {
      keyboard: [
        ["Get price"],
        ["Set Alert"],
        ["Cancel Alert"],
        ["Close menu"],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  })
);

function paginate(array, pageSize, pageNumber) {
  const start = pageNumber * pageSize;
  return array.slice(start, start + pageSize);
}

async function inlineButtons(ctx) {
  const page = ctx.wizard.state.page;
  const pageSize = 5;

  const tokensOnPage = paginate(dataToken, pageSize, page);

  const selectedTokens = ctx.wizard.state.selectedTokens || [];

  const inlineKeyboard = tokensOnPage.map((item) => [
    Markup.button.callback(item.symbol, item.symbol),
  ]);

  const navigationButtons = [];
  if (page > 0) {
    navigationButtons.push(Markup.button.callback("⬅️ Previous", "prevPage"));
  }
  if ((page + 1) * pageSize < dataToken.length) {
    navigationButtons.push(Markup.button.callback("Next ➡️", "nextPage"));
  }

  navigationButtons.push(Markup.button.callback("✅ Done", "done"));

  if (navigationButtons.length > 0) {
    inlineKeyboard.push(navigationButtons);
  }

  await ctx
    .editMessageText(
      "Choose your tokens and press Done when finish",
      Markup.inlineKeyboard(inlineKeyboard)
    )
    .catch(() => {
      ctx.reply(
        "Choose your tokens and press Done when finish",
        Markup.inlineKeyboard(inlineKeyboard)
      );
    });
}

const getTokenPrice = new Scenes.WizardScene(
  "getPrice",
  async (ctx) => {
    if (dataToken.length === 0) {
      return ctx.reply("No tokens found. Please try again later.");
    }

    ctx.wizard.state.page = 0;

    await inlineButtons(ctx);

    return ctx.wizard.next();
  },
  async (ctx) => {
    const callbackData = ctx.callbackQuery?.data;

    if (callbackData) {
      if (callbackData === "nextPage") {
        ctx.wizard.state.page++;
        await inlineButtons(ctx);
      } else if (callbackData === "prevPage") {
        ctx.wizard.state.page--;
        await inlineButtons(ctx);
      } else if (dataToken.some((item) => item.symbol === callbackData)) {
        const selectedToken = dataToken.find(
          (item) => item.symbol === callbackData
        );

        if (selectedToken) {
          await ctx.reply(
            `The price of ${selectedToken.symbol} is ${selectedToken.lastPrice} USDT.`
          );
        } else {
          ctx.reply("Token not found. Please try again.");
        }

        await inlineButtons(ctx);
      } else if (callbackData === "done") {
        await ctx.reply("All done, thanks!");
        return ctx.scene.leave();
      }
    }
  }
);

const setAlertPrice = new Scenes.WizardScene(
  "setAlert",
  async (ctx) => {
    if (dataToken.length === 0) {
      return ctx.reply("No tokens found. Please try again later.");
    }

    ctx.wizard.state.page = 0;
    ctx.wizard.state.selectedToken = null;

    await inlineButtons(ctx);

    return ctx.wizard.next();
  },
  async (ctx) => {
    const callbackData = ctx.callbackQuery?.data;

    if (callbackData) {
      if (callbackData === "nextPage") {
        ctx.wizard.state.page++;
        await inlineButtons(ctx);
      } else if (callbackData === "prevPage") {
        ctx.wizard.state.page--;
        await inlineButtons(ctx);
      } else if (dataToken.some((item) => item.symbol === callbackData)) {
        const selectedToken = dataToken.find(
          (item) => item.symbol === callbackData
        );

        if (selectedToken) {
          ctx.wizard.state.selectedToken = selectedToken;

          await ctx.reply(
            `You selected ${selectedToken.symbol}. Please choose another token or press Done.`
          );
          await inlineButtons(ctx);
        } else {
          ctx.reply("Token not found. Please try again.");
        }
      }

      if (callbackData === "done") {
        if (ctx.wizard.state.selectedToken) {
          await ctx.reply(
            `You selected ${ctx.wizard.state.selectedToken.symbol}. Please enter the price for the alert`
          );
          return ctx.wizard.next();
        } else {
          return ctx.reply("No token selected. Please choose a token first.");
        }
      }
    }
  },
  async (ctx) => {
    const messageText = ctx.message ? ctx.message.text : null;

    if (
      !/^\d+(\.\d+)?$/.test(messageText) ||
      isNaN(parseFloat(messageText)) ||
      parseFloat(messageText) <= 0
    ) {
      return ctx.reply("Please enter a valid price.");
    } else {
      const price = parseFloat(messageText);
      const selectedToken = ctx.wizard.state.selectedToken;

      if (selectedToken) {
        await ctx.reply(
          `Alert set for ${selectedToken.symbol} at ${price} USDT.`
        );
        await setAlert(price, selectedToken.symbol, ctx.chat.id, bot);
        return ctx.scene.leave();
      } else {
        await ctx.reply("No token selected.");
        return ctx.scene.leave();
      }
    }
  }
);

const stage = new Stage([getTokenPrice, setAlertPrice]);

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
bot.use(stage.middleware());
bot.hears("Get price", (ctx) => ctx.scene.enter("getPrice"));
bot.hears("Set Alert", (ctx) => ctx.scene.enter("setAlert"));
bot.launch();
