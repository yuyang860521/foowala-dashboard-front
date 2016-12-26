/*
 * Author:  Magic<magic@foowala.com>
 * Module description: register info
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    register_info_Schema    = new Schema({
        name  : String, //name
        phone:{type: Number, required:true},
        email:{type: String, default:"未填写"},
        store_name:{type: String, default:"未填写"},//公司名称
        store_type:{type: String, default:"未填写"},//公司类型
        store_address:String,//公司地址
        status:{type:Number, default:0},//0未处理，1正在处理，2，注册成功3废弃数据
        formate_time:String,
        CreateTime: { type: Date, default: Date.now }
    });

register_info_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

register_info_Schema.pre('save', (next) => {
  next();
});

register_info_Schema.statics = {
  findById(_id, callback) {
    this.findOne({
      _id: _id
    }, (err, info) => {
      callback(info);
    });
  }
}

mongoose.model('register_info', register_info_Schema, 'register_info');
