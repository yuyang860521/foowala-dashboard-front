const moment 				 = require('moment'),
      localTime 		 = require('moment-timezone');

var exports = {
  getTime() {
    return localTime.tz(moment(), "Asia/Shanghai");
  },

  getTimeDetail() {
    const time = localTime.tz(moment(), "Asia/Shanghai"),
          year = Number(time.format("YYYY")),
          month = Number(time.format("MM")),
          day = Number(time.format("DD"));
    let format_time = {};
    format_time.year = year;
    format_time.month = month;
    format_time.day = day;
    format_time.full = year + "-" + month + "-" + day;
    return format_time;
  }
};

module.exports = exports;
