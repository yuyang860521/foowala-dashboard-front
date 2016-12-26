/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 商品
 */

var mongoose 		     = require('mongoose'),
  	Schema 			     = mongoose.Schema,
  	product_Schema 	 = new Schema({
      name      : String,
      en_name   : String,
      menu_id   : Schema.Types.ObjectId,
      price     : {type: Number, default: 0, min: 0, set: v => Number(v).toFixed(2)},   // 单价
      unit      : {type: String, default: '份'},   // 单位
      lab       : [String], // 快速备注标签
      img_url   : String,   // 图片地址
      order     : {type: Number, default: 0},   // 排序
      delete    : {type:Boolean,default:false}, //删除状态
      CreateTime: {type: Date, default: Date.now}
  	});

product_Schema.virtual('date').get(() => {
	this._id.getTimestamp();
});

product_Schema.pre('save', next => {
	next();
});

product_Schema.statics = {
	findById(_id, callback) {
		this.findOne({
			_id: _id
		}, (err, product) => {
			callback(product);
		});
	}
}

mongoose.model('product', product_Schema, 'product');
