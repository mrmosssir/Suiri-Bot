const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const express = require("express");
const cors = require("cors");

const app = express();

const { help_info } = require("./models/help_info");

const methods = require("./methods/methods");
const note_method = require("./methods/note_method");
const e = require("express");

app.use(
  cors({
    origin: true,
  })
);

app.post("/", async (req, res) => {
  const isTelegramMessage = req.body.message;
  const isTelegramCallback = req.body.callback_query;

  if (isTelegramMessage) {
    const message = isTelegramMessage;
    const message_content = message.text;

    if (/\/money/.test(message_content)) {
      return res.status(200).send(methods.inlineKeyboardMoney(message));
    } else if (/\/note/.test(message_content)) {
      note_method.cacheNoteList(message.chat.id).then((response) => {
        return res
          .status(200)
          .send(note_method.inlineKeyboardNoteCategory(message));
      });
    } else if (/\/help/.test(message_content)) {
      let result = `我是你的生活小秘書 Suiri\n你可以使用我處理大大小小的事情\n\n以下是我現在擁有的功能：\n\n`;
      help_info.forEach((item) => {
        result += `${item.command} - ${item.content}\n`;
      });
      return res.status(200).send({
        method: "sendMessage",
        chat_id: message.chat.id,
        text: result,
      });
    } else if (/\/cancel/.test(message_content)) {
      return res.status(200).send(methods.cancelSendFeature(message));
    } else {
      methods.defaultMessage(message).then((response) => {
        return res.status(200).send(response);
      });
    }
  } else if (isTelegramCallback) {
    const callback_query = isTelegramCallback;
    const callback_data = callback_query.data.toString();

    if (callback_data === "/keep_money") {
      return res
        .status(200)
        .send(methods.inlineKeyboardMoneyCategory(callback_query));
    } else if (/\/note/.test(callback_data)) {
      methods.note(callback_query, callback_data).then((response) => {
        return res.status(200).send(response);
      });
    } else if (callback_data === "/cancel") {
      return res
        .status(200)
        .send(methods.removeInlineKeyboardMessage(callback_query));
    } else {
      return res.status(200).send(methods.defaultQueryMessage(callback_query));
    }
  } else {
    return res.status(200).send({
      status: "error message",
    });
  }
  return false;
});

exports.api = functions.https.onRequest(app);
