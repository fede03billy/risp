/* Compatibility fallback for older node versions where fromEntries is not a function */
if (!Object.fromEntries) {
  Object.fromEntries = function (entries) {
    return entries.reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});
  };
}

/* Import and initialization */
const { Telegraf, Markup } = require("telegraf");
const { Configuration, OpenAIApi } = require("openai");
let state = null;
let subject = "Matematica"; // default
let language = "Italiano"; // default
let age = "18"; // default
let prompt = "Come va?"; // default
async function answer(fullPrompt) {
  let answer = "Potrebbe essersi verificato un errore. Riprova più tardi.";
  try {
    const response = await openai.createCompletion({
      prompt: fullPrompt,
      model: "text-davinci-003",
      temperature: 0.5,
      max_tokens: 2000,
      n: 1,
      top_p: 0.65,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });
    answer = response.data.choices[0].text
      ? response.data.choices[0].text
      : "Potrebbe essersi verificato un errore. Riprova più tardi.";
  } catch (err) {
    if (err.response) {
      console.log(err.response.status);
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }
  } finally {
    return answer;
  }
}

/* Check if Telegraf is imported properly and log something to let me know the server is running */
if (Telegraf) {
  console.log("Telegraf OK");
}
/* Configure OpenAI API */
const configuration = new Configuration({
  apiKey: process.env.YOUR_API_KEY,
});
const openai = new OpenAIApi(configuration);

/* Configure Telegraf bot */
const bot = new Telegraf(process.env.BOT_TOKEN);

/* Bot functions */
bot.start((ctx) => {
  ctx.reply(
    "Benvenuto! Utilizzando il menù seleziona la materia, l'età e la lingua, poi inserisci la tua richiesta."
  );
});

bot.help((ctx) => {
  ctx.reply(
    "Puoi selezionare la materia con il comando /subject, l'età con il comando /age, la lingua con il comando /language e inserire la tua richiesta con il comando /prompt."
  );
});

/* Bot Middleware */
bot.use(async (ctx, next) => {
  if (
    ctx.message.text === "/subject" ||
    ctx.message.text === "/age" ||
    ctx.message.text === "/language" ||
    ctx.message.text === "/prompt" ||
    ctx.message.text === "/start" ||
    ctx.message.text === "/help"
  ) {
    next();
  }
  if (state === "subject") {
    subject = ctx.message.text;
    ctx.reply(`Hai selezionato ${subject}.`);
    state = null;
  } else if (state === "age") {
    age = ctx.message.text;
    ctx.reply(`Hai selezionato ${age}.`);
    state = null;
  } else if (state === "language") {
    language = ctx.message.text;
    ctx.reply(`Hai selezionato ${language}.`);
    state = null;
  } else if (state === "prompt") {
    prompt = ctx.message.text;
    let fullPrompt = `Vorrei che tu agisca come un insegnante di ${subject} che sta spiegando dei concetti a uno studente di ${age} anni. Ti farò una domanda, ed è il tuo compito spiegarmi la risposta in termini di facile comprensione. Questo potrebbe includere utilizzare istruzioni passo per passo, dimostrazioni e varie tecniche visuali o meno, oppure ancora suggerire del materiale per approfondire l'argomento. La mia richiesta è "${prompt}". Rispondi in ${language}.`;
    console.log(fullPrompt);
    ctx.reply(await answer(fullPrompt));
    state = null;
  } else if (state === null) {
    // ctx.reply(await answer(ctx.message.text));
    // This is temporary disabled because all the message from the user are sent to OpenAI API, which is not what is intended, we must exclude the selected options from the menu and the commands
    if (ctx.message.callback_query) {
      ctx.reply(
        "Usa il comando /prompt per scegliere la richiesta che vuoi fare."
      );
    }
  }
});

bot.command("subject", (ctx) => {
  state = "subject";
  ctx.reply(
    "Seleziona la materia:",
    Markup.keyboard([
      ["Italiano", "Inglese"],
      ["Scienze", "Matematica"],
      ["Storia", "Geografia"],
      ["Informatica", "Altro"],
    ])
      .oneTime()
      .resize()
  );
});

bot.command("age", (ctx) => {
  state = "age";
  ctx.reply(
    "Seleziona la tua età:",
    Markup.keyboard([
      ["13", "14", "15", "16"],
      ["17", "18", "19", "20"],
      ["21", "22", "23", "24"],
    ])
      .oneTime()
      .resize()
  );
});

bot.command("language", (ctx) => {
  state = "language";
  ctx.reply(
    "Seleziona la tua lingua:",
    Markup.keyboard([["Italiano", "Inglese"]])
      .oneTime()
      .resize()
  );
});

bot.command("prompt", (ctx) => {
  state = "prompt";
  ctx.reply("Inserisci la tua richiesta:");
});

bot.launch();
