const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('Welcome to my Telegram bot!');
});

bot.help((ctx) => {
    ctx.reply('I can help you with many things. Just type /help to see a list of commands.');
});

bot.on('text', (ctx) => {
    ctx.reply('I am sorry, I did not understand what you said. Please type /help for a list of commands.');
});

bot.launch();
