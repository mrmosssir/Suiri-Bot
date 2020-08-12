const firebase = require('firebase');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const express = require('express');
const cors = require('cors');

const app = express();

const methods = require('./methods');
const e = require('express');

methods.cacheNoteList();

app.use(cors({
    origin: true
}))

app.post('/', async (req, res) => {

    const isTelegramMessage = req.body.message;
    const isTelegramCallback = req.body.callback_query;

    if (isTelegramMessage) {

        const message = isTelegramMessage;
        const message_content = message.text;

        if (/\/money/.test(message_content)) {
            return res.status(200).send(methods.inlineKeyboardMoney(message));
        } else if (/\/note/.test(message_content)) {
            return res.status(200).send(methods.inlineKeyboardNoteCategory(message));
        } else if (/\/cancel/.test(message_content)) {
            return res.status(200).send(methods.cancelSendFeature(message));
        } else if (/\/testImport/.test(message_content)) {
            return res.status(200).send(methods.databaseImportForTest());
        } else {
            return res.status(200).send(methods.defaultMessage(message));
        }
    } else if (isTelegramCallback) {

        const callback_query = isTelegramCallback;
        const callback_data = callback_query.data.toString();

        if (callback_data === '/keep_money') {
            return res.status(200).send(methods.inlineKeyboardMoneyCategory(callback_query));
        } else if (callback_data === '/note_category_work' || callback_data === '/note_category_private') {
            methods.inlineKeyboardNoteList(callback_query, callback_data.split('_')[2]).then((response) => {
                return res.status(200).send(response);
            });
        } else if (/\/note_item/.test(callback_data)) {
            methods.getNoteItemContent(callback_query).then((response) => {
                return res.status(200).send(response);
            });
        } else if (/\/note_add/.test(callback_data)) {
            return res.status(200).send(methods.addNoteItem(callback_query));
        } else if (callback_data === '/note_next' || callback_data === '/note_pre') {
            if (methods.changeNotePage(callback_query)) {
                methods.inlineKeyboardNoteList(callback_query).then((response) => {
                    return res.status(200).send(response);
                });
            }
        } else if (callback_data === '/note_back_main' || callback_data === '/note_back_list') {
            methods.backNote(callback_query).then((response) => {
                return res.status(200).send(response);
            })
        } else if (callback_data === '/cancel') {
            return res.status(200).send(methods.removeInlineKeyboardMessage(callback_query));
        } else {
            return res.status(200).send(methods.defaultQueryMessage(callback_query));
        }
    } else {
        return res.status(200).send({
            status: 'problem message'
        })
    }
    return false;
})

exports.api = functions.https.onRequest(app)