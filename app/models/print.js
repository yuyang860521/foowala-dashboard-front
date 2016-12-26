/*
 * Author:  Magic<magic@foowala.com>
 * Module description: 打印记录
 */

const mongoose 		   = require('mongoose'),
  	  Schema 			   = mongoose.Schema,
  	  print_Schema 	 = new Schema({
      name      : String,
      order_id  : Schema.Types.ObjectId,
      status    : {type:Boolean, default:false},
      printe_num: {type: String, required: true},
      order_item: [Schema.Types.ObjectId],
      CreateTime: {type: Date, default:Date.now}
  	});

print_Schema.virtual('date').get(() => {
	this._id.getTimestamp();
});

print_Schema.pre('save', next => {
	next();
});

print_Schema.statics = {
	findById(_id, callback) {
		this.findOne({
			_id: _id
		}, (err, menu) => {
			callback(menu);
		});
	}
}

mongoose.model('print', print_Schema, 'print');
