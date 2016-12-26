/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 菜单
 */

'use strict';

var mongoose 		   = require('mongoose'),
  	Schema 			   = mongoose.Schema,
  	menu_Schema 	 = new Schema({
      store_id  : Schema.Types.ObjectId,
      name      : String,
      printer_num: {type: Number, required: true},
      order     : {type: Number, default: 0},
      labels    : [Schema.Types.ObjectId],
      delete    : {type:Boolean,default:false},
      CreateTime: {type: Date, default:Date.now}
  	});

menu_Schema.virtual('date').get(() => {
	this._id.getTimestamp();
});

menu_Schema.pre('save', next => {
	next();
});

menu_Schema.statics = {
	findById(_id, callback) {
		this.findOne({
			_id: _id
		}, (err, menu) => {
			callback(menu);
		});
	}
}

mongoose.model('menu', menu_Schema, 'menu');
