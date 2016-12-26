/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 商店
 */

var async 	  = require('async'),
	mongoose    = require('mongoose'),
	store_mongo = mongoose.model('store'),
  _qr = require('../helpers/qr_make');

var exports = {

	insert(data, callback) {
		var model = new store_mongo(data);
		model.save((err) => {
      if(err) {
        console.error('ERROR: 新增商店失败');
        console.dir(data);
        callback(false);
      } else callback(true);
		})
	},

  create(data){
    return new Promise((resolve, reject)=>{
          var model = new store_mongo(data);
          model.save((err, store) => {
            if(err) {
              reject(err)
            }
            resolve(store)
          })
    })
  },

  createByRegister(data){
    return new Promise((resolve, reject)=>{
        var model = new store_mongo(data);
        model.save((err, store) => {
          if(err) {
            reject(err)
          }
          resolve(store)
        })
    })
  },

  updatePromise(_id, data){
    return new Promise((resolve, reject)=>{
          store_mongo.update({_id: _id}, data, (err, row) => {
            if(err) {
              console.error('ERROR: 修改商店信息失败，_id:', _id);
              reject(err)
            } else {
              console.log('SUCCESS: 修改商店信息成功,受影响个数：', row);
              resolve(row)
            }
        });
    })
  },

  update(id, data, callback) {
    store_mongo.update({_id: id}, data, (err, row) => {
      if(err) {
        console.error('ERROR: 修改商店信息失败，_id:', id);
        console.dir(data);
        callback(false);
      } else {
        console.log('SUCCESS: 修改商店信息成功,受影响个数：', row);
        callback(true);
      }
    });
  },

  delete(id, callback) {
    this.getStoreById(id, (store) => {
      if(store) return callback(true);
      store.remove((err) => {
        if(err) {
          console.error('ERROR: 删除商店信息失败，_id:', id);
          console.dir(data);
          callback(false);
        } else {
          console.log('SUCCESS: 删除商店信息成功');
          callback(true);
        }
      });
    });
  },

	getStoreAll(callback) {
		store_mongo.find({}).exec((err, store) => {
			callback(store);
		})
	},

  getStoreById(id, callback) {
    store_mongo.findById(id, store => {
      callback(store);
    });
  },

  getStoreByIdPromise(id) {
    return new Promise((resolve, reject)=>{
      store_mongo.findById(id, store => {
        resolve(store);
      });
    })
  },
  
  getStaffQr(store_id){
    const staff_id = 'store_id=' + store_id + '?register';
    return new Promise((resolve, reject)=>{
      store_mongo.findById({ _id: store_id}, (store) => {
          const register_qr = store.register_qr?store.register_qr:"";
          if (register_qr !== "" && register_qr) {
            resolve(register_qr)
          }else{
            _qr.createQrstr(staff_id)
               .then(tikect => {
                 store.register_qr = tikect;
                 store.save(err => {
                  if (err) {reject(err)}
                  this.getStaffQr(store_id);
                 })
               })
          }

      })
    })
  },

  getStoreByName(name, callback) {
    store_mongo.findOne({name: name}, (err, store) => {
      if (err) {console.log(err)}
      callback(store);
    });
  },

  getStoreByQuery(query) {
    return new Promise((resolve, reject)=>{
      store_mongo.find(query, (err, store) => {
        resolve(store);
      });
    })
  },

  getStoreByOrderIdPromise(_id) {
    return new Promise((resolve, reject) => {
      store_mongo.findOne({_id}, (err, store) => {
        if (err) {reject(err)}
        resolve(store);
      });
    })
  },

	selectStoreForName(name, callback) {
		store_mongo.findOne({name: name}, (err, store) => {
			if(store) return callback(false);
			else return callback(true);
		});
	}
};

module.exports = exports;
