const { database } = require('./dbInit');

exports.importForTest = function () {
    database.ref('/api/note').set({
        "note_list": {
            "work": [
                {
                    "id": 96688171,
                    "title": "Work - 1",
                },
                {
                    "id": 96688173,
                    "title": "Work - 2",
                }
            ],
            "private": [
                {
                    "id": 96688179,
                    "title": "Private - 1",
                },
                {
                    "id": 96688180,
                    "title": "Private - 2",
                }
            ]
        },
        "note_content": [
            {
                "id": 96688171,
                "date": 1596688171,
                "title": "Work - 1",
                "content": "Work_訊息測試 - 1"
            },
            {
                "id": 96688173,
                "date": 1596688173,
                "title": "Work - 2",
                "content": "Work_訊息測試 - 2"
            },
            {
                "id": 96688179,
                "date": 1596688179,
                "title": "Private - 1",
                "content": "Private_訊息測試 - 1"
            },
            {
                "id": 96688180,
                "date": 1596688180,
                "title": "Private - 2",
                "content": "Private_訊息測試 - 2"
            }
        ],
    });

}