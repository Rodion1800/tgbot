import { dataToken } from "./request.js";
import { Markup } from "telegraf";

function paginate(array, pageSize, pageNumber) {
  const start = pageNumber * pageSize;
  return array.slice(start, start + pageSize);
}

export async function inlineButtons(ctx) {
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
