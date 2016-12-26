/*
 * Author: Magic <magic@foowala.com>
 * Module description: printer service
 */

var async = require('async'),
    _order = require('./order.service');

var printer = {
    getPreprintOrder (option) {
        return new Promise((resolve, reject) => {
            _order.getOrderItemByOrderPromise(option)
                  .then(data => {
                      data.info.desk_number = data.info.desk_number.toString();
                      data.info.people_number = data.info.people_number.toString();
                      data.result.total = Number(data.result.total).toFixed(2).toString();
                      data.result.actual_payment = Number(data.result.actual_payment).toFixed(2).toString();
                      data.result.discount_money = Number(data.result.discount_money).toFixed(2).toString();
                      let orderitems = [];
                      async.each(data.orderitems, (rs, cb)=>{
                          let item = {};
                          item.product_name = rs.product_name;
                          item.spec = rs.spec;
                          item.labels = rs.labels;
                          item.actual_payment = Number(rs.actual_payment).toFixed(2).toString();
                          item.total = Number(rs.total).toFixed(2).toString();
                          item.discount = Number(rs.discount).toFixed(2).toString();
                          item.price = Number(rs.price).toFixed(2).toString();
                          item.number = rs.number.toString();
                          orderitems.push(item);
                          cb();
                      }, err => {
                          delete data.orderitems;
                          data.order_items = orderitems;
                          resolve(data)
                      })
                  })
                  .catch(err => {
                    console.log(err);
                    reject(err)
                  })
        })
    },
    getPrintClear (option) {
        return new Promise((resolve, reject) => {
            let result = {};
            this.getPreprintOrder(option)
                  .then(data => {
                    result = data;
                    const _id = option.order_id;
                    return _order.getOrderByIdPromise({_id});
                  })
                  .then(order => {
                    let pay_info = {}, pay = order.pay;
                    pay_info.change = "0"
                    if (pay === 0) {
                      pay_info.pay = "人民币";
                      pay_info.change = Number(order.real_payment-order.actual_payment).toString();
                    }else if(pay === 1) {
                      pay_info.pay = "刷卡";
                    }else if(pay===2){
                      pay_info.pay = "支付宝";
                    }else if(pay===3){
                      pay_info.pay = "微信";
                    }
                    pay_info.real_payment = order.real_payment.toString();
                    pay_info.actual_payment = Number(order.actual_payment).toFixed(2).toString();
                    pay_info.discount_money = Number(order.total-order.actual_payment).toFixed(2).toString();
                    pay_info.total = Number(order.total).toFixed(2).toString();
                    result.pay_info = pay_info;
                    resolve(result)
                  })
                  .catch(err => {
                    console.log(err);
                    reject(err)
                  })
        })
    },

    getPrintOrderisAdd(option){
      return new Promise((resolve, reject) => {
        _order.getOrderItemByOrderidWhichisAdd(option)
              .then(result => {
                let products = result.products,
                    rs = [];
                async.each(products, (pro, cb)=>{
                  let item = {};
                  let labels_pre = [];
                  item.product_name = pro.product_name;
                  item.price = Number(pro.price).toFixed(2).toString();
                  item.number = pro.number.toString();
                  item.discount_money = Number(pro.total-pro.actual_payment).toFixed(2).toString();
                  const labels = pro.labels;
                  async.each(labels, (lab, callback) => {
                    labels_pre.push(lab.label);
                    callback();
                  },err=>{
                    item.labels = labels_pre;
                  })
                  rs.push(item);
                  cb();
                },err=>{
                  resolve(rs);
                })
              })
              .catch(err => {
                console.log(err);
                reject(err);
              })
      })
    }
};

module.exports = exports = printer;
