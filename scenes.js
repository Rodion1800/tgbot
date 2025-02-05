import { Scenes } from "telegraf";
import { setAlert } from "./alert.js";
import { dataToken } from "./request.js";
import { inlineButtons } from "./pagination.js";
import { bot } from "./bot.js";

const { WizardScene, Stage } = Scenes;

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

export const stages = new Stage([getTokenPrice, setAlertPrice]);
