/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 订单
 */

const math_help = require('../helpers/math');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    order_Schema = new Schema({
        _id: String,
        store_id: Schema.Types.ObjectId, // 所属门店
        desk_number: [Number], // 桌号
        desk_id: [Schema.Types.ObjectId], //桌子_id
        people_number: Number, // 用餐人数
        total: { type: Number, default: 0, min: 0, set: v => Number(v).toFixed(2) },//总价
        staff_id: Schema.Types.ObjectId,
        staff_nickname: String,
        job_number: String,
        remark: { type: String, default: '' },
        status: { type: Number, default: 0 }, // 订单状态，0: 已开但没商品,1: 待付款, 2: 取消，3，已完成,
        pay: {type: Number, default: 0}, // 付款方式
        discount: { type: Number, min: 0, max: 100, default: 100, set: v => Number(v).toFixed(2) }, // 折扣
        actual_payment: { type: Number,default:0.0, min: 0, set: v => Number(v).toFixed(2) }, // 应该收款
        real_payment: { type: Number,default:0.0, min: 0, set: v => Number(v).toFixed(2) }, // 实际收款
        format_time: String,
        format_time_sec: String,
        clear_time: {
            format_time: String,
            time: Date
        },
        CreateTime: { type: Date, default: Date.now }
    });

order_Schema.virtual('actual_integer').get(function(){
    return Math.round(this.actual_payment).toFixed(2);
});

order_Schema.virtual('actual_decimals').get(function(){
    const actual_decimals = (Math.round(this.actual_payment*10)/10).toFixed(2);
    return actual_decimals;
});

order_Schema.pre('save', (next) => {
    next();
});

order_Schema.statics = {
    findById(_id, callback) {
        this.findOne({
            _id: _id
        }, (err, order) => {
            callback(order);
        });
    }
}

mongoose.model('order', order_Schema, 'order');
