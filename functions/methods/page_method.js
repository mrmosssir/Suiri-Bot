// data param = { method, category, per, length, current }
exports.control = function (data) {
  if (data.length > 3) {
    if ((data.current + 1) * 3 >= data.length) {
      return [
        {
          text: "<<<",
          callback_data: `/${data.method}_page_pre_${data.category}`,
        },
      ];
    } else if (data.current === 0) {
      return [
        {
          text: ">>>",
          callback_data: `/${data.method}_page_next_${data.category}`,
        },
      ];
    } else {
      return [
        {
          text: "<<<",
          callback_data: `/${data.method}_page_pre_${data.category}`,
        },
        {
          text: ">>>",
          callback_data: `/${data.method}_page_next_${data.category}`,
        },
      ];
    }
  }
  return null;
};
