import { dataToken } from "./request.js";

export async function getInlinePrice(ctx) {
  const query = ctx.inlineQuery.query.trim().toUpperCase();

  let filteredTokens = dataToken;
  if (query) {
    filteredTokens = dataToken.filter((item) =>
      item.symbol.toUpperCase().includes(query)
    );
  }

  const results = filteredTokens.slice(0, 10).map((item, index) => ({
    type: "article",
    id: String(index),
    title: `${item.symbol} - ${item.lastPrice} USDT`,
    description: `Current price: ${item.lastPrice} USDT`,
    input_message_content: {
      message_text: `${item.symbol}
 Current price: ${item.lastPrice} USDT`,
      parse_mode: "Markdown",
    },
  }));

  await ctx.answerInlineQuery(results, { cache_time: 0 });
}
