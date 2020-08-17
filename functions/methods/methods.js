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

exports.note = function (callback_query, callback_data) {
  return new Promise((resolve, reject) => {
    if (/\/note_category/.test(callback_data)) {
      note_method
        .inlineKeyboardNoteList(callback_query, callback_data.split("_")[2])
        .then((response) => {
          resolve(response);
          return;
        });
    } else if (/\/note_item/.test(callback_data)) {
      note_method.getNoteItemContent(callback_query).then((response) => {
        resolve(response);
        return;
      });
    } else if (/\/note_add/.test(callback_data)) {
      resolve(note_method.addNoteItem(callback_query));
      return;
    } else if (/\/note_page/.test(callback_data)) {
      note_method.pageNote(callback_query);
      note_method
        .inlineKeyboardNoteList(callback_query, callback_data.split("_")[3])
        .then((response) => {
          resolve(response);
          return;
        });
    } else if (/\/note_edit/.test(callback_data)) {
      resolve(note_method.editNoteItem(callback_query));
      return;
    } else if (/\/note_remove/.test(callback_data)) {
      note_method.removeNoteItem(callback_query).then((response) => {
        resolve(response);
        return;
      });
    } else if (/\/note_back/.test(callback_data)) {
      note_method.backNote(callback_query).then((response) => {
        resolve(response);
        return;
      });
    }
  });
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
        text: `我看不懂這個 可以教教我或使用 /help 來看看我懂那些指令哦`,
      });
    }
  });
};

exports.defaultQueryMessage = function (callback) {
  return {
    method: "sendMessage",
    chat_id: callback.message.chat.id,
    text: `功能目前維護中！請稍後再試\n如有任何問題可連絡我們：\nMail：uchen7489@gmail.com`,
  };
};

exports.removeInlineKeyboardMessage = function (callback) {
  return {
    method: "deleteMessage",
    chat_id: callback.message.chat.id,
    message_id: callback.message.message_id,
  };
};

exports.cancelSendFeature = function (msg) {
  featureNow.feature = "/default";
  featureNow.step = 1;
  return {
    method: "sendMessage",
    chat_id: msg.chat.id,
    text: `輸入操作已經取消囉`,
  };
};
