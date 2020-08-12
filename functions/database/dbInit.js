const firebase = require('firebase');
const app = firebase.initializeApp({
    apiKey: "AIzaSyAqBVwFaYg0k3SUQW23jGFRhk0kAWBtB2U",
    authDomain: "subot-d3b06.firebaseapp.com",
    databaseURL: "https://subot-d3b06.firebaseio.com",
    projectId: "subot-d3b06",
    storageBucket: "subot-d3b06.appspot.com",
    messagingSenderId: "1044966317473"
});

exports.database = firebase.database(app);