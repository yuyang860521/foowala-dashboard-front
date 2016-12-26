/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 订单点菜详情
 */

var mongoose 		     = require('mongoose'),
  	Schema 			     = mongoose.Schema,
  	order_item_Schema= new Schema({
      order_id      : String,
      printer_num   : {type:Number, default:1},
      menu_id       : Schema.Types.ObjectId, // menu id
      menu_name     : String, // menu name
      product_id    : Schema.Types.ObjectId,  // 绑定商品
      labels        : [{
        _id:Schema.Types.ObjectId,
        label:String,
        isChecked:{type:Boolean, default: true}
      }],
      product_name  : String,     // 绑定商品
      img           : String,     // 商品图片
      spec          : String,     // 规格
      is_add        : {type: Boolean, default: true}, // 是否为追加状态
      number        : {type: Number, default: 1},     // 数量
      price         : {type: Number, default: 0, set: v => Number(v).toFixed(2)}, // 单价
      discount      : {type: Number, min: 0, max: 100, default: 100, set: v => Number(v).toFixed(2)},   // 折扣
      total         : {type: Number, default: 0, set: v => Number(v).toFixed(2)},// 总价
      actual_payment: { type: Number, min: 0, set: v => Number(v).toFixed(2) }, // 实际收款
      status        : {type: Boolean, default: false},                          // 上菜状态
      is_cancled    : {type: Boolean, default: false},                          //商品删除状态
      CreateTime    : { type: Date, default: Date.now }
  	});

 order_item_Schema.pre('save', (next) => {
	next();
});

 order_item_Schema.statics = {
	findById(_id, callback) {
		this.findOne({
			_id: _id
		}, (err, order_item) => {
			callback(order_item);
		});
	}
}

mongoose.model('order_item',  order_item_Schema, 'order_item');
