const { inline_keyboard } = require("../models/inline_keyboard");

const note_method = require("./note_method");

let featureNow = {
  feature: "/default",
  step: 1,
};

exports.setStatus = function (
  feature = featureNow.feature,
  step = featureNow.step
) {
  featureNow = {
    feature,
    step,
  };
};

exports.inlineKeyboardMoney = function (msg) {
  return {
    method: "sendMessage",
    chat_id: msg.chat.id,
    text: `What's function do you want, Boss ?`,
    reply_markup: JSON.stringify({
      inline_keyboard: inline_keyboard.money,
    }),
  };
};

exports.defaultMessage = function (msg) {
  return new Promise((resolve, reject) => {
    if (/\/note_add/.test(featureNow.feature)) {
      note_method
        .addNoteItemProcess(msg, featureNow.feature, featureNow.step)
        .then((response) => {
          resolve(response);
          return;
        });
    } else if (/\/note_edit/.test(featureNow.feature)) {
      note_method
        .editNoteItemProcess(msg, featureNow.feature, featureNow.step)
        .then((response) => {
          resolve(response);
          return;
        });
    } else {
      resolve({
        method: "sendMessage",
        chat_id: msg.chat.id,
        text: `Ok... That's a message, but I don't understand.`,
      });
    }
  });
};

exports.defaultQueryMessage = function (callback) {
  return {
    method: "sendMessage",
    chat_id: callback.message.chat.id,
    text: `Oops !! This feature is on maintenance...Sorry`,
  };
};

exports.removeInlineKeyboardMessage = function (callback) {
  return {
    method: "editMessageText",
    chat_id: callback.message.chat.id,
    message_id: callback.message.message_id,
    text: `OK... It's closed !`,
  };
};

exports.cancelSendFeature = function (msg) {
  featureNow.feature = "/default";
  featureNow.step = 1;
  return {
    method: "sendMessage",
    chat_id: msg.chat.id,
    text: `OK, interrupt input`,
  };
};
