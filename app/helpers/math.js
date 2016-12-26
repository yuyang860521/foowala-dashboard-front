var math_help = {
  decimal(num, v, fix) {
    var vv = Math.pow(10,v);
  	return (Math.round(num*vv)/vv).toFixed(fix);
  },

  fixed(num, fix) {
  	return Number(num).toFixed(fix);
  }
};

module.exports = exports = math_help;
