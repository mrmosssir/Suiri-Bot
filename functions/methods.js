const {
    inline_keyboard
} = require('./models/inline_keyboard');

const fileSystem = require('fs');
const {
    database
} = require('./database/dbInit');
const dbGet = require('./database/dbGet');
const dbPost = require('./database/dbPost');
const {
    resolve
} = require('path');

let featureNow = {
    feature: '/default',
    step: 1
};

let noteList = {};

let noteItem = {
    category: 'work',
    title: '',
    content: '',
}

let notePage = 0;
let noteListLength = 0;
let noteListCategory = null;

exports.inlineKeyboardMoney = function (msg) {
    return {
        method: 'sendMessage',
        chat_id: msg.chat.id,
        text: `What's function do you want, Boss ?`,
        reply_markup: JSON.stringify({
            inline_keyboard: inline_keyboard.money
        })
    };
}

exports.inlineKeyboardMoneyCategory = function (callback) {
    return {
        method: 'editMessageText',
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        text: `What's keep money category ?`,
        reply_markup: JSON.stringify({
            inline_keyboard: inline_keyboard.keep_money_category
        })
    }
}

exports.cacheNoteList = function () {
    database.ref('api/note').once('value', (snapshot) => {
        noteList = snapshot.val();
        notePage = 0;
    })
}

exports.inlineKeyboardNoteCategory = function (msg) {
    return {
        method: 'sendMessage',
        chat_id: msg.chat.id,
        text: `Which record do you want, Boss ?`,
        reply_markup: JSON.stringify({
            inline_keyboard: inline_keyboard.note_category
        })
    };
}

exports.inlineKeyboardNoteList = function (callback, category = null) {
    return new Promise((resolve, reject) => {
        if (category !== null) {
            noteListCategory = category;
        } else {
            category = noteListCategory;
        }
        let inline_list = [];
        let list = noteList.note_list[category];
        let count = 0;
        noteListLength = Object.keys(list).length;
        for (let prop in list) {
            if (count >= notePage * 3 && count < notePage * 3 + 3) {
                inline_list.push([{
                    text: list[prop].title,
                    callback_data: `/note_item_${prop}`
                }])
            }
            count += 1;
        }
        if (noteListLength > 3) {
            if ((notePage + 1) * 3 >= noteListLength) {
                inline_list.push([{
                    text: '<<<',
                    callback_data: '/note_pre'
                }])
            } else if (notePage === 0) {
                inline_list.push([{
                    text: '>>>',
                    callback_data: '/note_next'
                }])
            } else {
                inline_list.push([{
                        text: '<<<',
                        callback_data: '/note_pre'
                    },
                    {
                        text: '>>>',
                        callback_data: '/note_next'
                    }
                ])
            }
        }
        inline_list.push(inline_keyboard.note_features.backMain);
        resolve({
            method: 'editMessageText',
            chat_id: callback.message.chat.id,
            message_id: callback.message.message_id,
            text: 'These is your note list, Boss !!',
            reply_markup: JSON.stringify({
                inline_keyboard: inline_list
            })
        });
    })
}

exports.getNoteItemContent = function (callback) {
    let callback_data = callback.data.toString();
    let id = callback_data.split('_')[2];
    return new Promise((resolve, reject) => {
        console.log(noteList.note_content);
        let item = noteList.note_content[id];
        let time = new Date(item.date).toLocaleDateString().replace(/\//g, "-");

        resolve({
            method: 'editMessageText',
            chat_id: callback.message.chat.id,
            message_id: callback.message.message_id,
            parse_mode: 'HTML',
            text: `<strong><u>${item.title}</u></strong>\n\n<b>紀錄時間：${time}</b>\n\n<b>內容：</b>\n${item.content}`,
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{
                            text: '編輯',
                            callback_data: `/note_edit_${id}`
                        },
                        {
                            text: '移除',
                            callback_data: `/note_remove_${id}`
                        }
                    ],
                    inline_keyboard.note_features.backList
                ]
            })
        })
    })
}

exports.addNoteItem = function (callback) {
    let callback_data = callback.data.toString();
    if (callback_data.split('_').length < 3) {
        return {
            method: 'editMessageText',
            chat_id: callback.message.chat.id,
            message_id: callback.message.message_id,
            text: `I see, what this note category ?`,
            reply_markup: JSON.stringify({
                inline_keyboard: inline_keyboard.note_add_category
            })
        }
    } else {
        featureNow.feature = callback_data;
        featureNow.step = 1;
        noteItem.category = callback_data.split('_')[2]
        return {
            method: 'editMessageText',
            chat_id: callback.message.chat.id,
            message_id: callback.message.message_id,
            text: `OK, send me "Title" text for this note\nYou can send /cancel when change mind`
        }
    }
}

exports.editNoteItem = function (callback) {

}

exports.changeNotePage = function (callback) {
    let mode = callback.data.toString().split('_')[1];
    if (mode === 'next') {
        if (notePage * 3 < noteListLength) {
            notePage += 1;
            return true;
        } else {
            return false;
        }
    } else if (mode === 'pre') {
        if (notePage > 0) {
            notePage -= 1;
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

exports.backNote = function (callback) {
    let mode = callback.data.toString().split('_')[2];
    return new Promise((resolve, reject) => {
        if (mode === 'list') {
            this.inlineKeyboardNoteList(callback).then((response) => {
                resolve(response);
                return;
            })
        } else if (mode === 'main') {
            notePage = 0;
            resolve({
                method: 'editMessageText',
                chat_id: callback.message.chat.id,
                message_id: callback.message.message_id,
                text: `Which record do you want, Boss ?`,
                reply_markup: JSON.stringify({
                    inline_keyboard: inline_keyboard.note_category
                })
            });
            return;
        }
        return;
    })
}

exports.defaultMessage = function (msg) {
    if (/\/note_add/.test(featureNow.feature)) {
        let key = '';
        switch (featureNow.step) {
            case 1:
                noteItem.title = msg.text;
                featureNow.step = 2;
                return {
                    method: 'sendMessage',
                        chat_id: msg.chat.id,
                        text: 'Receive title and next please send the note content'
                }
                case 2:
                    noteItem.content = msg.text;
                    key = database.ref(`/api/note/note_list/${noteItem.category}`).push().key.replace('_', '-');
                    database.ref(`/api/note/note_list/${noteItem.category}`).child(key).set({
                        title: noteItem.title
                    });
                    database.ref('/api/note/note_content').child(key).set({
                        date: new Date().valueOf(),
                        category: noteItem.category,
                        title: noteItem.title,
                        content: noteItem.content
                    })
                    featureNow.feature = '/default';
                    featureNow.step = '1';
                    this.cacheNoteList();
                    return {
                        method: 'sendMessage',
                            chat_id: msg.chat.id,
                            text: 'Done !! note save complete, you can execute /note to view this note'
                    }
                    default:
                        featureNow.feature = '/default';
                        featureNow.step = '1';
                        return {
                            method: 'sendMessage',
                                chat_id: msg.chat.id,
                                text: 'Sorry, data break...please try again !!'
                        }
        }
    } else {
        return {
            method: 'sendMessage',
            chat_id: msg.chat.id,
            text: `Ok... That's a message, but I don't understand.`
        }
    }
}

exports.defaultQueryMessage = function (callback) {
    return {
        method: 'sendMessage',
        chat_id: callback.message.chat.id,
        text: `Oops !! This feature is on maintenance...Sorry`
    }
}

exports.removeInlineKeyboardMessage = function (callback) {
    return {
        method: 'editMessageText',
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        text: `OK... It's closed !`
    }
}

exports.cancelSendFeature = function (msg) {
    featureNow.feature = '/default';
    featureNow.step = 1;
    return {
        method: 'sendMessage',
        chat_id: msg.chat.id,
        text: `Huh...OK, interrupt input`
    }
}

exports.databaseImportForTest = function () {
    dbPost.importForTest();
}