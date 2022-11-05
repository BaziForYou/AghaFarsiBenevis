import {Telegraf} from 'telegraf';
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const rp = require("request-promise");
require('dotenv').config()

function getENV(envName){
  // this function safely loads environment variables
  if(process.env[envName] && process.env[envName].length === 0){
    console.error(`Error loading env variable ${envName}`)
    process.exit(1)
  }
  return process.env[envName]
}


console.info("Generating Bot System...");
const bot = new Telegraf(getENV('AFABE_TG_BOT_TOKEN'));

const API = 'https://9mkhzfaym3.execute-api.us-east-1.amazonaws.com/production/convert';

async function Translate(Text) {
  let List = Text.split(" ");
  let FinalText = "";
  const SendingInfo = ". " + Text.toLowerCase() + " ."; // Don't ask me why :|
  const options = {
    method: 'POST',
    uri: API,
    headers: {
      'Referer': 'https://behnevis.com/',
      'Origin': 'https://behnevis.com',
      'Save-Data': 'on',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
      'DNT': '1',
      'Content-Type': 'text/plain',
    },
    body: SendingInfo,
    json: true
  };
  await rp(options).then(function (response) {
    for (const key in response) {
      for (let i = 0; i < List.length; i++) {
        if (List[i].toLowerCase() === key) {
          List[i] = response[key];
        }
      }
    }
    FinalText = List.join(" ");
  });
  return FinalText
}

const ListeningCommands = [
  "فارسیشو میخوام",
  "فارسیشو بده",
  "فارسیشو بگو",
  "ف میخوام",
  "ف بده",
  "ف بگو",
  "گشادم بخونم",
  "فینگلیش",
  "هوی ترجمه کن",
  "بغ بغ",
  "بغ بغو",
  "ف",
]

bot.on('text', async (ctx) => {
  // if (ctx.message.chat.type == "group" || ctx.message.chat.type == "supergroup") {
  //   ctx.leaveChat();
  // }
  if (ctx.chat.type === "private") {
    if (/[a-zA-Z]/.test(ctx.message.text)) {
      let newText = await Translate(ctx.message.text);
      await ctx.reply(newText,
            {reply_to_message_id: ctx.message.message_id});
    } else {
      await ctx.reply("اینکه فینگلیش نیست",
            {reply_to_message_id: ctx.message.message_id});
    }
  } else if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
    const skipWay = ctx.message.text.slice(-1) === "*";
    if (ListeningCommands.includes(ctx.message.text) || skipWay) {
      const TargetMessage = skipWay ? ctx.message.text.slice(0, -1) : ctx.message.reply_to_message.text;
      if (ctx.message.reply_to_message || skipWay) {
        if (/[a-zA-Z]/.test(TargetMessage)) {
          let newText = await Translate(TargetMessage);
          await ctx.reply(newText,
                {reply_to_message_id: ctx.message.message_id});
        } else {
          await ctx.reply("اینکه فینگلیش نیست",
                {reply_to_message_id: ctx.message.message_id});
        }
      }
    }
  }
});

console.info("Starting Bot");
await bot.launch();
console.info("Bot Launched");

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
