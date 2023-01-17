if (!Object.fromEntries) {
    Object.fromEntries = function (entries) {
      return entries.reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
    };
  }
  
  const { Telegraf } = require("telegraf");
  const { Configuration, OpenAIApi } = require("openai");
  
  if (Telegraf) {console.log("Telegraf OK")}
  
  const configuration = new Configuration({
    apiKey: process.env.YOUR_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  
  const bot = new Telegraf(process.env.BOT_TOKEN);
  
  bot.start((ctx) => {
    ctx.reply("Welcome to my Telegram bot!");
  });
  
  bot.help((ctx) => {
    ctx.reply("You have been fooled.");
  });
  
  bot.on('text', async (ctx) => {
      const prompt = ctx.message.text;
      try {
          const response = await openai.createCompletion({
              prompt: prompt,
              model: "text-davinci-002",
              temperature: 0.5,
              max_tokens: 5,
              n: 1,
              top_p: 1,
          });
          ctx.reply(response.choices[0].text);
      } catch (err) {
          console.log(err);
          ctx.reply("Sorry, there was an error processing your request. Please try again later.");
      }
  });
  
  bot.launch();
  