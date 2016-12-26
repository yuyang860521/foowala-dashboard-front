/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 工作记录
 */
/**
 * [mongoose description]
 * @type {schema}
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    work_Schema = new Schema({
        store_id: Schema.Types.ObjectId, //store id
        staff_id: Schema.Types.ObjectId, //staff id
        report_id: Schema.Types.ObjectId, //report id
        nickname: String, // 员工 nick name
        job_number: String, //staff job number
        order_ids: [String], //订单号
        bill_ids: [Schema.Types.ObjectId], //bill id
        total: { type: Number, min: 0, set: v => Number(v).toFixed(2) }, // 总盈利
        order_total: { type: Number, min: 0, set: v => Number(v).toFixed(2) },
        order_list: [{
            pay: { type: Number },
            money: { type: Number, min: 0, set: v => Number(v).toFixed(2) }
        }],
        bill_total: { type: Number, min: 0, set: v => Number(v).toFixed(2) },
        bill_list: [{
            pay: { type: Number },
            money: { type: Number, min: 0, set: v => Number(v).toFixed(2) }
        }],
        startTime: { type: Date, default: Date.now }, // 开始上班时间
        format_time : {
            year:Number,
            month:Number,
            day:Number,
            full:String
        },
        endTime: Date // 下班时间
    });

work_Schema.virtual('date').get(() => {
    this._id.getTimestamp();
});

work_Schema.pre('save', (next) => {
    next();
});

work_Schema.statics = {
    findById: (_id, callback) => {
        this.findOne({
            _id: _id
        }, (err, work) => {
            callback(work);
        });
    }
}

mongoose.model('work', work_Schema, 'work');
