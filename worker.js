const TOKEN = `BotToken` // From @BotFather
const WEBHOOK = '/endpoint'
const SECRET = `SomeSecret` // A-Z, a-z, 0-9, _ and -
const API = 'https://9mkhzfaym3.execute-api.us-east-1.amazonaws.com/production/convert';

const EndingLetters = [
  "*",
  "_",
  "__"
]
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
  "ف"
]
const ignoreRegex = {
  "url" : /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g,
  "emailRegex" : /(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi,
  "userName" : /(?:@|(?:(?:(?:https?:\/\/)?t(?:elegram)?)\.me\/))(\w{4,})$/gm
}

addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))
  // } else if (url.pathname === '/registerWebhook') {
  //   event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
  // } else if (url.pathname === '/unRegisterWebhook') {
  //   event.respondWith(unRegisterWebhook(event))
  } else {
    event.respondWith(new Response('No handler for this request'))
  }
})

async function handleWebhook (event) {
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }

  const update = await event.request.json()
  event.waitUntil(onUpdate(update))

  return new Response('Ok')
}

async function onUpdate (update) {
  if ('message' in update) {
    await onMessage(update.message)
  }
}

function onMessage (message) {
  return workOnMessage(message)
}

async function sendPlainText (chatId, text) {
  return (await fetch(apiUrl('sendMessage', {
    chat_id: chatId,
    text
  }))).json()
}

async function sendReply (chatId, text, replyToMessageId) {
  return (await fetch(apiUrl('sendMessage', {
    chat_id: chatId,
    text,
    reply_to_message_id: replyToMessageId
  }))).json()
}

async function registerWebhook (event, requestUrl, suffix, secret) {
  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
  const r = await (await fetch(apiUrl('setWebhook', { url: webhookUrl, secret_token: secret }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

async function unRegisterWebhook (event) {
  const r = await (await fetch(apiUrl('setWebhook', { url: '' }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

function apiUrl (methodName, params = null) {
  let query = ''
  if (params) {
    query = '?' + new URLSearchParams(params).toString()
  }
  return `https://api.telegram.org/bot${TOKEN}/${methodName}${query}`
}

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
  try {
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
      
      try {
        const response = await fetch(API, {
          method: 'POST',
          headers: {
            'Referer': 'https://behnevis.com/',
            'Origin': 'https://behnevis.com',
            'Save-Data': 'on',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
            'DNT': '1',
            'Content-Type': 'text/plain',
          },
          body: SendingInfo
        });
        
        if (response.ok) {
          const responseBody = await response.json();
          if (responseBody) {
            delete responseBody['."'] // still dont ask me why :|
            delete responseBody['".'] // still dont ask me why :|
            for (let i = 0; i < FlatList.length; i++) {
              const CheckingWord = FlatList[i].toLowerCase();
              const canTranslate = await isValidForTranslate(CheckingWord);
              if (canTranslate) {
                const checkWordLower = CheckingWord.toLowerCase();
                if (responseBody[checkWordLower]) {
                  FlatList[i] = responseBody[checkWordLower];
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
  کد خطا: ${response.status}`)
        }
      } catch (err) {
        const error = err.toString();
        resolve(`مشکلی در فرایند ترجمه پیش آمده است لطفا بعدا دوباره تلاش کنید
  خطا: ${error}`)
      }
    });
  } catch (err) {
    console.error("Error in Translate function:", err);
    return "خطایی در ترجمه رخ داده است. لطفا بعدا دوباره تلاش کنید.";
  }
}

async function workOnMessage(ctx) {
  try {
    const currentMessage = ctx.caption || ctx.text;
    if (ctx.chat.type === "private") {
      if (currentMessage) {
        if (/[a-zA-Z]/.test(currentMessage)) {
          let newText = await Translate(currentMessage);
          await sendReply(ctx.chat.id, newText, ctx.message_id);
        } else {
          await sendReply(ctx.chat.id, "اینکه فینگلیش نیست", ctx.message_id);
        }
      }
    } else if ((currentMessage && currentMessage.length > 0) && (ctx.chat.type !== "private")) {
      const LastWord = currentMessage.split(" ").pop();
      const skipWay = EndingLetters.includes(LastWord);
      if ((currentMessage && ListeningCommands.includes(currentMessage.toLowerCase())) || skipWay) {
        const messageToCheck = ctx.reply_to_message 
        ? ((ctx.reply_to_message.caption !== undefined) ? ctx.reply_to_message.caption : (ctx.reply_to_message.text !== undefined) 
        ? ctx.reply_to_message.text : null) : currentMessage;
        if (!messageToCheck) {
          await sendReply(ctx.chat.id, "پیامی برای ترجمه وجود ندارد", ctx.message_id);
          return;
        }
        const TargetMessage = skipWay ? currentMessage.slice(0, (LastWord.length * -1)) : messageToCheck;
        if (/[a-zA-Z]/.test(TargetMessage)) {
          let newText = await Translate(TargetMessage);
          await sendReply(ctx.chat.id, newText, ctx.message_id);
        } else {
        }
        await sendReply(ctx.chat.id, "اینکه فینگلیش نیست", ctx.message_id);
      }
    }
  } catch (err) {
    console.error("Error in workOnMessage:", err);
    await sendReply(ctx.chat.id, "خطایی در پردازش پیام رخ داده است. لطفا بعدا دوباره تلاش کنید.", ctx.message_id);
  }
}