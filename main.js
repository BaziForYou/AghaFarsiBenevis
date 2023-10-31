import {Telegraf} from 'telegraf';
import dotenv from 'dotenv';
import { promisify } from "util";
import request from "request";
const rp = promisify(request);

dotenv.config()
function getENV(envName){
  if(process.env[envName] && process.env[envName].length === 0){
    console.error(`Error loading env variable ${envName}`)
    process.exit(1)
  }
  return process.env[envName]
}

console.info("Generating Bot System...");
const ignoreRegex = {
  "url" : /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g,
  "emailRegex" : /(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi,
  "userName" : /(?:@|(?:(?:(?:https?:\/\/)?t(?:elegram)?)\.me\/))(\w{4,})$/gm
}
const bot = new Telegraf(getENV('AFABE_TG_BOT_TOKEN'));
const ListeningCommands = getENV('AFABE_TG_Listening_Words').toLowerCase().split(',')
const EndingLetters = getENV('AFABE_TG_Auto_End_Letter').toLowerCase().split(',')
const API = 'https://9mkhzfaym3.execute-api.us-east-1.amazonaws.com/production/convert';

async function isValidForTranslate(text) {
  return new Promise((resolve, reject) => {
    let isValid = true;
    for (const key in ignoreRegex) {
      const regex = ignoreRegex[key];
      if (regex.test(text)) {
        isValid = false;
        break;
      }
    }
    resolve(isValid);
  });
}

async function Translate(Text) {
  return new Promise(async (resolve, reject) => {
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
    await rp(options).then(async function (response) {
      if (response.statusCode == 200) {
        if (response && response.body && response.body['."'] && response.body['".']) {
          delete response.body['."'] // still dont ask me why :|
          delete response.body['".'] // still dont ask me why :|
          for (let i = 0; i < FlatList.length; i++) {
            const CheckingWord = FlatList[i].toLowerCase();
            const canTranslate = await isValidForTranslate(CheckingWord);
            if (canTranslate) {
              const checkWordLower = CheckingWord.toLowerCase();
              if (response.body[checkWordLower]) {
                FlatList[i] = response.body[checkWordLower];
              }
            }
          }
          const FinalText = FlatList.join(" ");
          resolve(FinalText);
        } else {
          resolve(`مشکلی در وب سرویس ها پیش آمده است لطفا بعد از چند ثانیه دوباره تلاش کنید
کد خطا: Wrong Body Response`)
        }
      } else {
        resolve(`مشکلی در وب سرویس ها پیش آمده است لطفا بعد از چند ثانیه دوباره تلاش کنید
کد خطا: ${response.statusCode}`)
      }
    }).catch(function (err) {
      const error = toString(err.error || err);
      resolve(`مشکلی در فرایند ترجمه پیش آمده است لطفا بعدا دوباره تلاش کنید
خطا: ${error}`)
    });
  });
}

async function workOnMessage(ctx) {
  const currentMessage = ctx.message.caption || ctx.message.text;
  if (ctx.chat.type === "private") {
    if (currentMessage) {
      if (/[a-zA-Z]/.test(currentMessage)) {
        let newText = await Translate(currentMessage);
        await ctx.reply(newText,
              {reply_to_message_id: ctx.message.message_id});
      } else {
        await ctx.reply("اینکه فینگلیش نیست",
              {reply_to_message_id: ctx.message.message_id});
      }
    }
  } else if ((currentMessage && currentMessage.length > 0) && (ctx.chat.type === "group" || ctx.chat.type === "supergroup")) {
    const LastWord = currentMessage.split(" ").pop();
    const skipWay = EndingLetters.includes(LastWord);
    if ((currentMessage && ListeningCommands.includes(currentMessage.toLowerCase())) || skipWay) {
      const TargetMessage = skipWay ? currentMessage.slice(0, (LastWord.length * -1)) : (ctx.message.reply_to_message.caption || ctx.message.reply_to_message.text);
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

bot.on('text', workOnMessage);
bot.on('photo', workOnMessage);
bot.on('sticker', workOnMessage);
bot.on('video', workOnMessage);
bot.on('video_note', workOnMessage);
bot.on('voice', workOnMessage);
bot.on('audio', workOnMessage);
bot.on('animation', workOnMessage);
bot.on('document', workOnMessage);
bot.on('poll', workOnMessage);
bot.on('contact', workOnMessage);
bot.on('location', workOnMessage);

console.info("Starting Bot");
await bot.launch();
console.info("Bot Launched");

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));