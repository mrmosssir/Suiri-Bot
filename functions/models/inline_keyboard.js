let money = [
    [{
        text: '記帳',
        callback_data: '/keep_money'
    }],
    [{
        text: '查看花費',
        url: 'https://www.google.com/'
    }],
    [{
        text: 'Cancel',
        callback_data: '/cancel'
    }]
];

let keep_money_category = [
    [{
        text: '食物',
        callback_data: '/keep_money_category'
    }],
    [{
        text: '交通',
        callback_data: '/keep_money_category'
    }],
    [{
        text: '娛樂',
        callback_data: '/keep_money_category'
    }],
    [{
        text: 'Cancel',
        callback_data: '/cancel'
    }]
]

let note_features = {
    add: [{
        text: '新增事項',
        callback_data: '/note_add'
    }],
    cancel: [{
        text: 'Cancel',
        callback_data: '/cancel'
    }],
    backMain: [{
        text: '返回選單',
        callback_data: '/note_back_main'
    }],
    backList: [{
        text: '返回列表',
        callback_data: '/note_back_list'
    }]

}

let note_category = [
    [{
        text: '工作',
        callback_data: '/note_category_work'
    }],
    [{
        text: '私人',
        callback_data: '/note_category_private'
    }],
    note_features.add,
    note_features.cancel
]

let note_add_category = [
    [
        {
            text: '工作',
            callback_data: '/note_add_work'
        },
        {
            text: '私人',
            callback_data: '/note_add_private'
        }
    ],
    note_features.cancel
]

exports.inline_keyboard = {
    money,
    keep_money_category,
    note_features,
    note_category,
    note_add_category
}