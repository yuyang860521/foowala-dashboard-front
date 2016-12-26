/*
 * Author:  Magic<magic@foowala.com>
 * Module description: day report
 */

var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    bill_Schema    = new Schema({
      store_id  : Schema.Types.ObjectId,
      staff_id: Schema.Types.ObjectId,
      type: {type:String, default:"人民币"},//type
      money: String,//chou dachao
      people_name: String,
      label: String,
      formate_time: String, //formate time
      CreateTime: {type: Date, default: Date.now}
    });

bill_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

bill_Schema.pre('save', (next) => {
  next();
});

bill_Schema.statics = {
  findById(_id, callback) {
    this.findOne({
      _id: _id
    }, (err, desk) => {
      callback(desk);
    });
  }
}

mongoose.model('bill', bill_Schema, 'bill');
