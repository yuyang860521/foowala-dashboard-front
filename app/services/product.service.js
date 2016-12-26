/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 商店
 */

var async 	    = require('async'),
	mongoose      = require('mongoose'),
	product_mongo = mongoose.model('product');


var exports = {

	insert(data, callback) {

		var model = new product_mongo(data);

		model.save((err, product) => {
      if(err) {
        console.log(err)
        console.error('ERROR: 新增商品失败');
        callback(false, null);
      } else callback(true, product);
		});
	},

  update(id, data, callback) {
    product_mongo.update({_id: id}, {$set:data}, (err, row) => {
      if(err) {
        console.error('ERROR: 修改商品信息失败，_id:', id);
        callback(false);
      } else {
        console.log('SUCCESS: 修改商品资料成功,受影响个数：', row);
        callback(true);
      }
    });
  },

  delete(id, callback) {
    product_mongo.update({_id: id}, {delete:true}, (err, row) => {
      if(err) {
        console.error('ERROR: 修改商品delete状态true失败，_id:', id);
        callback(false);
      } else {
        console.log('SUCCESS: 修改商品delete状态true成功，_id', row);
        callback(true);
      }
    });
  },

	getProductAll(callback) {
		product_mongo.find({}).exec((err, product) => {
			callback(product);
		})
	},

  getProductNotDel(callback){
    const query = product_mongo.where({delete:false});
    query.find({})
         .exe((err, product) => {
          callback(product);
         });
  },

  getProductById(id, callback) {
    product_mongo.findById(id, product => {
      callback(product);
    });
  },

  getProductByMenu(menu_id, callback) {
    product_mongo.find({menu_id, delete: false}).sort({order: 1}).exec((err, products) => {
      callback(products);
    });
  },

  getProductByMenuNotDel(menu_id, callback) {
    const query = product_mongo.where({delete:false});
    query.find({menu_id: menu_id})
         .sort({order: 1})
         .exec((err, products) => {
            callback(products);
          });
  },

  getProductByMenuDel(menu_id, callback) {
    const query = product_mongo.where({delete:true});
    query.find({menu_id: menu_id})
         .sort({order: 1})
         .exec((err, products) => {
            callback(products);
          });
  },
};

module.exports = exports;
