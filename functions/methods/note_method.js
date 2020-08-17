const { inline_keyboard } = require("../models/inline_keyboard");
const page_method = require("./page_method");
const methods = require("./methods");
const { database } = require("../database");

let noteList = {};
let noteItem = {
  category: "work",
  title: "",
  content: "",
};
let notePage = 0;
let noteListLength = 0;

exports.cacheNoteList = function () {
  return new Promise((resolve, reject) => {
    database.ref("api/note").once("value", (snapshot) => {
      noteList = snapshot.val();
      console.log(noteList);
      notePage = 0;
      resolve(true);
    });
  });
};

// mode => ( false: sendMessage, true: editMessageText )
exports.inlineKeyboardNoteCategory = function (msg, mode = false) {
  let result = {
    method: "sendMessage",
    text: `Which record do you want, Boss ?`,
    reply_markup: JSON.stringify({
      inline_keyboard: inline_keyboard.note_category,
    }),
  };
  if (mode) {
    result.method = "editMessageText";
    result.chat_id = msg.message.chat.id;
    result.message_id = msg.message.message_id;
  } else {
    result.chat_id = msg.chat.id;
  }
  console.log(result);
  return result;
};

exports.inlineKeyboardNoteList = function (callback, category) {
  return new Promise((resolve, reject) => {
    let inline_list = [];
    let list = {};
    try {
      list = noteList.note_list[category];
    } catch (e) {
      resolve({
        method: "editMessageText",
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        text: "Sorry, this category has no data.",
        reply_markup: JSON.stringify({
          inline_keyboard: [inline_keyboard.note_features.backMain],
        }),
      });
    }
    let count = 0;
    noteListLength = Object.keys(list).length;
    for (let prop in list) {
      if (count >= notePage * 3 && count < notePage * 3 + 3) {
        inline_list.push([
          {
            text: list[prop].title,
            callback_data: `/note_item_${prop}`,
          },
        ]);
      }
      count += 1;
    }
    let page = page_method.control({
      method: "note",
      category: category,
      per: 3,
      length: noteListLength,
      current: notePage,
    });
    if (page !== null) {
      inline_list.push(page);
    }
    inline_list.push(inline_keyboard.note_features.backMain);
    resolve({
      method: "editMessageText",
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: "These is your note list, Boss !!",
      reply_markup: JSON.stringify({
        inline_keyboard: inline_list,
      }),
    });
  });
};

exports.getNoteItemContent = function (callback) {
  let callback_data = callback.data.toString();
  let id = callback_data.split("_")[2];
  return new Promise((resolve, reject) => {
    let item = noteList.note_content[id];
    let time = new Date(item.date).toLocaleDateString().replace(/\//g, "-");
    noteItem.category = item.category;
    noteItem.title = item.title;
    noteItem.content = item.content;
    resolve({
      method: "editMessageText",
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      parse_mode: "HTML",
      text: `<strong><u>${item.title}</u></strong>\n\n<b>紀錄時間：${time}</b>\n\n<b>內容：</b>\n${item.content}`,
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "編輯",
              callback_data: `/note_edit_${id}`,
            },
            {
              text: "移除",
              callback_data: `/note_remove_${id}`,
            },
          ],
          [
            {
              text: "返回列表",
              callback_data: `/note_back_list_${item.category}`,
            },
          ],
        ],
      }),
    });
  });
};

exports.addNoteItem = function (callback) {
  let callback_data = callback.data.toString();
  if (callback_data.split("_").length < 3) {
    return {
      method: "editMessageText",
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: `I see, what this note category ?`,
      reply_markup: JSON.stringify({
        inline_keyboard: inline_keyboard.note_add_category,
      }),
    };
  } else {
    methods.setStatus(callback_data, 1);
    noteItem.category = callback_data.split("_")[2];
    return {
      method: "editMessageText",
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: `OK, send me "Title" text for this note\nYou can send /cancel when change mind`,
    };
  }
};

exports.addNoteItemProcess = function (msg, callback, step) {
  let key;
  return new Promise((resolve, reject) => {
    switch (step) {
      case 1:
        noteItem.title = msg.text;
        methods.setStatus(callback, 2);
        resolve({
          method: "sendMessage",
          chat_id: msg.chat.id,
          text: "Receive title and next please send the note content",
        });
        break;
      case 2:
        noteItem.content = msg.text;
        key = database.ref(`/api/note/note_list/${noteItem.category}`).push()
          .key;
        while (key.indexOf("_") !== -1) {
          key.replace("_", "-");
        }
        database
          .ref(`/api/note/note_list/${noteItem.category}`)
          .child(key)
          .set({
            title: noteItem.title,
          });
        database.ref("/api/note/note_content").child(key).set({
          date: new Date().valueOf(),
          category: noteItem.category,
          title: noteItem.title,
          content: noteItem.content,
        });
        methods.setStatus("/default", 1);
        this.cacheNoteList().then((response) => {
          resolve({
            method: "sendMessage",
            chat_id: msg.chat.id,
            text:
              "Done !! note save complete, you can execute /note to view this note",
          });
          return;
        });
        break;
      default:
        methods.setStatus("/default", 1);
        resolve({
          method: "sendMessage",
          chat_id: msg.chat.id,
          text: "Sorry, data break...please try again !!",
        });
    }
  });
};

exports.editNoteItem = function (callback) {
  let callback_data = callback.data.toString();
  methods.setStatus(callback_data, 1);
  return {
    method: "editMessageText",
    chat_id: callback.message.chat.id,
    message_id: callback.message.message_id,
    text: `OK ! Please send Title first or command /cancel to exit`,
  };
};

exports.editNoteItemProcess = function (msg, callback, step) {
  return new Promise((resolve, reject) => {
    let id = callback.split("_")[2];
    switch (step) {
      case 1:
        noteItem.title = msg.text !== "/noset" ? msg.text : noteItem.title;
        methods.setStatus(callback, 2);
        resolve({
          method: "sendMessage",
          chat_id: msg.chat.id,
          text: `set Title complete and now send Content or command /cancel to exit.\nif you don't want to set content you can send me /noset.`,
        });
        break;
      case 2:
        noteItem.content = msg.text !== "/noset" ? msg.text : noteItem.content;
        database
          .ref(`/api/note/note_list/${noteItem.category}`)
          .child(id)
          .update({
            title: noteItem.title,
          });
        database.ref("/api/note/note_content").child(id).update({
          category: noteItem.category,
          title: noteItem.title,
          content: noteItem.content,
        });
        methods.setStatus("/default", 1);
        this.cacheNoteList().then((response) => {
          resolve({
            method: "sendMessage",
            chat_id: msg.chat.id,
            text: `Done !! your note is update now.`,
          });
          return;
        });
        break;
      default:
        methods.setStatus("/default", 1);
        resolve({
          method: "sendMessage",
          chat_id: msg.chat.id,
          text: "Sorry, data break...please try again !!",
        });
    }
  });
};

exports.removeNoteItem = function (callback) {
  let callback_data = callback.data.toString();
  return new Promise((resolve, reject) => {
    if (callback_data.split("_").length <= 3) {
      methods.setStatus(callback_data, 1);
      resolve({
        method: "editMessageText",
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        text: "Are you sure you want to remove this note ?",
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "是",
                callback_data: `${callback_data}_yes`,
              },
              {
                text: "否",
                callback_data: `${callback_data}_no`,
              },
            ],
          ],
        }),
      });
    } else {
      let id = callback_data.split("_")[2];
      let accept = callback_data.split("_")[3];
      switch (accept) {
        case "yes":
          database
            .ref(`api/note/note_list/${noteItem.category}/${id}`)
            .remove();
          database.ref(`api/note/note_content/${id}`).remove();
          this.cacheNoteList().then((response) => {
            resolve({
              method: "editMessageText",
              chat_id: callback.message.chat.id,
              message_id: callback.message.message_id,
              text: "Done, note remove complete.",
              reply_markup: JSON.stringify({
                inline_keyboard: [inline_keyboard.note_features.backMain],
              }),
            });
            return;
          });
          break;
        case "no":
          this.getNoteItemContent(callback).then((response) => {
            resolve(response);
            return;
          });
          break;
        default:
          resolve({
            method: "sendMessage",
            chat_id: callback.message.chat.id,
            text: "Sorry, data break...please try again !!",
          });
          break;
      }
    }
  });
};

exports.backNote = function (callback) {
  let mode = callback.data.toString().split("_")[2];
  return new Promise((resolve, reject) => {
    if (mode === "list") {
      let category = callback.data.toString().split("_")[3];
      this.inlineKeyboardNoteList(callback, category).then((response) => {
        resolve(response);
        return;
      });
    } else if (mode === "main") {
      notePage = 0;
      resolve(this.inlineKeyboardNoteCategory(callback, true));
      return;
    }
    return;
  });
};

exports.pageNote = function (callback) {
    let callback_data = callback.data.toString();
    if (/\/note_page_next/.test(callback_data) && (notePage + 1) * 3 < noteListLength) {
        notePage += 1;
    } else if (/\/note_page_pre/.test(callback_data) && notePage > 0) {
        notePage -= 1;
    }
}
