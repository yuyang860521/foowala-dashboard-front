/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 商店
 */

var async = require('async'),
    mongoose = require('mongoose'),
    _product = require('./product.service'),
    menu_mongo = mongoose.model('menu'),
    product_mongo = mongoose.model('product'),
    objectid = require('objectid');

var exports = {

    insert(data, callback) {

        var model = new menu_mongo(data);

        model.save((err, entity) => {
            if (err) {
                console.error('ERROR: 新增菜单失败');
                callback(false, null);
            } else callback(true, entity);
        })
    },

    update(store_id, _id, data, callback) {
        menu_mongo.update({ 'store_id': store_id, '_id': _id }, data, (err, menu) => {
            if (!menu) return callback(false, null);
            return callback(true, menu);
        });
    },

    updateMenuLable(model) {
        return new Promise((resolve, reject) => {
            menu_mongo.findById(model.menu_id, menu => {
                if (menu) {
                    if (menu.labels.indexOf(model.label) > -1) {
                        menu.labels.splice(menu.labels.indexOf(model.label), 1);
                        menu.save(err => resolve(false))
                    } else {
                        menu.labels.push(model.label);
                        menu.save(err => resolve(true))
                    }
                } else resolve(false);

            });
        })
    },

    delete(id, callback) {
        menu_mongo.update({ _id: id }, { delete: true }, (err, menu) => {
            if (err) {
                console.error('ERROR: 删除菜单资料失败，_id:', id);
                callback(false);
            } else {
                console.log('SUCCESS: 删除菜单资料成功');
                callback(true);
            }
        })
    },

    getMenuAll(callback) {
        menu_mongo.find({}).exec((err, menu) => {
            callback(menu);
        });
    },

    getMenuById(id, callback) {
        menu_mongo.findById(id, menu => {
            if (menu) {
                _product.getProductByMenu(menu._id, products => {
                    menu.products = products;
                    callback(menu);
                });
            } else callback(menu);
        });
    },

    getMenuByObjectId(_id, callback) {
        menu_mongo.findById(_id, menu => {
            callback(menu);
        });
    },

    getMenuByStore(store_id, callback) {
        menu_mongo.find({ store_id: store_id }, (err, menus) => {
            var arr = [];
            async.each(menus, (menu, next) => {
                _product.getProductByMenuNotDel(menu._id, products => {
                    arr.push({ menu, products });
                    next();
                });
            }, err => {
                arr.sort((a, b) => a.menu.order - b.menu.order);
                return callback(arr);
            });
        });
    },

    getMenuByStoreList(store_id, callback) {
        menu_mongo.find({ store_id, delete: false }, (err, menus) => {
            callback(menus);
        }).sort({ order: 1 });
    },
    getMenuForDef(store_id, callback) {
        menu_mongo.findOne({ store_id }, (err, menu) => {
            callback(menu);
        }).sort({ order: 1 });
    },
    getMenuByStoreNotDel(store_id, callback) {
        const query = menu_mongo.where({ store_id: store_id })
            .sort({ order: 1, CreateTime: 1 });
        query.find({ delete: false }, (err, menus) => {
            var arr = [];
            async.each(menus, (menu, next) => {
                _product.getProductByMenuNotDel(menu._id, products => {
                    arr.push({ menu, products });
                    next();
                });
            }, err => {
                arr.sort((a, b) => a.menu.order - b.menu.order);
                return callback(arr);
            });
        });
    },
};

module.exports = exports;
