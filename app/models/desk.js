/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 桌号
 */

var mongoose 		   = require('mongoose'),
  	Schema 			   = mongoose.Schema,
  	desk_Schema 	 = new Schema({
      number    : Number,	// 桌号
      status    : {type: Number, min: 0, max: 4, default: 0},// 0：未开桌，1：开桌普通状态，2：打单未收费, 3:分桌子, 4:并桌
      store_id  : Schema.Types.ObjectId,
      floor     : {type: Number, default: 1},
      size      : {type: Number, min: 0, default: 4},
      CreateTime: {type: Date, default: Date.now}
  	});

desk_Schema.virtual('date').get(() => {
	this._id.getTimestamp();
});

desk_Schema.pre('save', (next) => {
	next();
});

desk_Schema.statics = {
	findById(_id, callback) {
		this.findOne({
			_id: _id
		}, (err, desk) => {
			callback(desk);
		});
	},

	get(_id){
		return this.findOne({_id:_id})
		           .exec()
		           .then(desk => {
			           	 if (desk) {
			           	 	return desk;
			           	 }
			           	 return Promise.reject("no such desk!")
		           })
	},

	updateStatus(_id, status) {
		return this.update({_id}, {status})
		           .exec();
	}
}

mongoose.model('desk', desk_Schema, 'desk');
