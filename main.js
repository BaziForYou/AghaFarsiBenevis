import {Telegraf} from 'telegraf';
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const rp = require("request-promise");
require('dotenv').config()

function getENV(envName){
  if(process.env[envName] && process.env[envName].length === 0){
    console.error(`Error loading env variable ${envName}`)
    process.exit(1)
  }
  return process.env[envName]
}


console.info("Generating Bot System...");
const bot = new Telegraf(getENV('AFABE_TG_BOT_TOKEN'));
const ListeningCommands = getENV('AFABE_TG_Listening_Words').toLowerCase().split(',')
const EndingLetters = getENV('AFABE_TG_Auto_End_Letter').toLowerCase().split(',')
const API = 'https://9mkhzfaym3.execute-api.us-east-1.amazonaws.com/production/convert';

async function Translate(Text) {
  const List = Text.split("\n").map((item) => item.split(" "));
  const NewList = List.map((item, index) => {
    if (index === 0) {
      return item;
    } else {
      return ["\n", ...item];
    }
  });
  let FlatList = NewList.flat().map((item) => {
    if (item.length > 1 && item.includes("'")) {
      const StatedWith = item.startsWith("'")
      const EndedWith = item.endsWith("'")
      const Cleaned = item.replace(/'/g, "")
      if (StatedWith && EndedWith) {
        return  "'" + Cleaned + "'";
      } else if (StatedWith) {
        return Cleaned + "'";
      } else if (EndedWith) {
        return "'" + Cleaned;
      } else {
        return Cleaned;
      }
    } else {
      return item;
    }
  });
  let FinalText = "";
  
  const SendingInfo = ". " + Text.replace(/'/g, "").replace(/\n/g, " ").toLowerCase() + " ."; // Don't ask me why :|
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
      for (let i = 0; i < FlatList.length; i++) {
        const CheckingWord = FlatList[i].toLowerCase();
        if (!CheckingWord.startsWith("@") && CheckingWord === key) {
          FlatList[i] = response[key];
        } else if (CheckingWord.includes("'") && CheckingWord.includes(key)) {
          FlatList[i] = CheckingWord.replace(key, response[key]);
        }
      }
    }
    FinalText = FlatList.join(" ");
  });
  return FinalText
}

bot.on('text', async (ctx) => {
  if (ctx.chat.type === "private") {
    if (/[a-zA-Z]/.test(ctx.message.text)) {
      let newText = await Translate(ctx.message.text);
      await ctx.reply(newText,
            {reply_to_message_id: ctx.message.message_id});
    } else {
      await ctx.reply("اینکه فینگلیش نیست",
            {reply_to_message_id: ctx.message.message_id});
    }
  } else if ((ctx.message.text && ctx.message.text.length > 0) && (ctx.chat.type === "group" || ctx.chat.type === "supergroup")) {
    const LastWord = ctx.message.text.split(" ").pop();
    const skipWay = EndingLetters.includes(LastWord);
    if ((ListeningCommands.includes(ctx.message.text.toLowerCase()) && ctx.message.reply_to_message) || skipWay) {
      const TargetMessage = skipWay ? ctx.message.text.slice(0, (LastWord.length * -1)) : ctx.message.reply_to_message.text;
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
});

console.info("Starting Bot");
await bot.launch();
console.info("Bot Launched");

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
