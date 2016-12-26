const async = require('async');

var total = {
    total_money (clearing, payment, cancel_order, open_account, callback) {
        let report = {};
        async.series({
            clearing: function(callback) {
                let total=0;
                for (let i = 0, len = clearing.length; i < len; i++) {
                    if (clearing[i].report_money) {
                        total += Number(clearing[i].report_money);
                    }
                }
                total = total.toFixed(2).toString();
                callback(null, total);
            },
            payment: function(callback) {
                let total=0;
                for (let i = 0, len = payment.length; i < len; i++) {
                    if (payment[i].take_bill) {
                        total += Number(payment[i].take_bill);
                    }
                }
                total = total.toFixed(2).toString();
                callback(null, total);
            },
            cancel_order: function(callback) {
                let total=0;
                for (let i = 0, len = cancel_order.length; i < len; i++) {
                    if (cancel_order[i].actual_payment) {
                        total += Number(cancel_order[i].actual_payment);
                    }
                }
                total = total.toFixed(2).toString();
                callback(null, total);
            },
            open_account: function(callback) {
                let total=0;
                for (let i = 0, len = open_account.length; i < len; i++) {
                    if (open_account[i].actual_payment) {
                        total += Number(open_account[i].actual_payment);
                    }
                }
                total = total.toFixed(2).toString();
                callback(null, total);
            }
        }, function(err, results) {
            report.total = results;
            report.clearing = clearing;
            report.payment = payment;
            report.cancel_order = cancel_order;
            report.open_account = open_account;
            callback(report);
        });
    }
}

module.exports = exports = total;
