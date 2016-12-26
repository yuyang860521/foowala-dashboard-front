/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 商店
 */

var async = require('async'),
    mongoose = require('mongoose'),
    encryption = require('../helpers/crypto'),
    staff_mongo = mongoose.model('staff'),
    _register_info = require('./register_info.service'),
    request = require('request'),
    _token = require('../helpers/token'),
    config = require('../../config/config');
var WechatAPI = require('wechat-api'),
    fs = require('fs');
var exports = {
    login(model, callback) {
        staff_mongo.findOne({
            store_id: model.store_id,
            job_number: model.job_number
        }, (err, staff) => {
            if (err) return callback(false, null);
            if (staff) {
                // 解密
                encryption.decipher(staff.password, staff.key, (pwd) => {
                    if (pwd == model.password) return callback(true, staff);
                    return callback(false, null);
                });
            } else callback(false, null);
        });
    },

    register(model, callback) {
        const open_id = model.open_id,
              store_id = model.store_id;
        staff_mongo.count({store_id}, (err, count) =>{
            staff_mongo.findOne({ store_id, open_id}, (err, staff) => {
                if (staff) {
                    staff.is_admin = model.is_admin;
                    staff.save((err, staff) => {
                        if (err) {
                            console.error('ERROR: 新增员工失败，门店 id：', model.store_id);
                            return callback(false, null);
                        } else { callback(true, staff) };
                    });
                } else {
                    encryption.cipher(model.password, (pwd, key) => {
                       _token.getToken(config.qr.token)
                           .then(accesstoken => {
                               const token = JSON.parse(accesstoken).data,
                                     userUrl = config.qr.userurl + token + '&openid=' + open_id + '&lang=zh_CN';
                                request.get(userUrl, (error, response, body) => {
                                    const nickname = JSON.parse(body).nickname;
                                    if (err) {
                                        console.log(err)
                                        return callback(false)
                                    } else {
                                        staff = new staff_mongo({
                                            nickname: nickname,
                                            open_id: model.open_id,
                                            store_id: model.store_id,
                                            job_number: count + 1,
                                            is_admin: model.is_admin,
                                            password: pwd,
                                            key: key
                                        });
                                        staff.save((err, result) => {
                                            if (err) {
                                                console.error('ERROR: 新增员工失败，门店 id：', model.store_id);
                                                callback(false, null);
                                            } else {
                                                callback(true, result)
                                            };
                                        });
                                    }
                                })
                           })
                           .catch((err) => {
                               if (err) {
                                   console.error(err);
                                   reject('get tikect fail');
                               }
                           })

                    });
                }
            });
        })
    },

    editorPassword(model, callback) {
        staff_mongo.findOne({ store_id: model.store_id, job_number: model.job_number }, (err, staff) => {
            if (err) return callback(false);
            if (staff) {
                // 解开密码
                encryption.decipher(staff.password, staff.key, (pwd) => {

                    if (pwd == model.password) {
                        // 匹对成功，更换新密码
                        encryption.key_cipher(model.new_password, staff.key, (password) => {

                            staff.password = password;
                            staff.save((err) => {
                                if (err) return callback(false, null);
                                return callback(true, staff);
                            });
                        });
                    } else return callback(false, null);
                });
            } else return callback(false);
        });
    },

    delete(id, callback) {
        this.getStaffById(id, (staff) => {
            if (staff){
                staff.remove((err) => {
                    if (err) {
                        console.error('ERROR: 删除店员资料失败，_id:', id);
                        console.dir(data);
                        callback(false);
                    } else {
                        console.log('SUCCESS: 删除店员资料成功');
                        callback(true);
                    }
                });
            }else{
                callback(false);
            }
        });
    },

    getStaffAll(callback) {
        staff_mongo.find({}).exec((err, staff) => {
            callback(staff);
        })
    },

    getStaffInfo(store_id) {
        return new Promise((resolve, reject) => {
            let staffInfos = [];
            staff_mongo.find({store_id}, (err, staffs) => {
                if (err) { reject('get staff info fail') }
                staffs.forEach(staff => {
                    let staffInfo = {};
                    staffInfo._id = staff._id;
                    staffInfo.open_id = staff.open_id;
                    staffInfo.nickname = staff.nickname;
                    staffInfos.push(staffInfo)
                })
                resolve(staffInfos);
            })
        })
    },

    getStaffById(id, callback) {
        staff_mongo.findById(id, (staff) => {
            callback(staff);
        });
    },
    getStaffByIdPromise(id) {
        return new Promise((resolve, reject) => {
            staff_mongo.findById(id, (staff) => {
                resolve(staff);
            });
        })
    },

    getStaffsOpenid() {
        return new Promise((resolve, reject) => {
            staff_mongo.find({}, (err, staffs) => {
                if (err) { reject(err) }
                let openids = [];
                for (var i = 0; i < staffs.length; i++) {
                    const openid = staffs[i].open_id;
                    if (openid) {
                        openids.push(openid);
                    }
                }
                resolve(openids);
            });
        })
    },

    getStaffByOpenid(open_id) {
        return new Promise((resolve, reject) => {
            staff_mongo.findOne({ open_id: open_id }, (err, staff) => {
                if (staff) {
                    resolve(staff);
                } else {
                    reject('get staff by openid fail')
                }
            });
        })
    },

    getStaffRgister(store_id, count) {
        return new Promise((resolve, reject) => {
            staff_mongo.count({store_id}, (err, staffs_count) => {
                const reduce_count = staffs_count - count;
                if (reduce_count > 0) {
                    var query = staff_mongo.find({store_id})
                                .sort({CreateTime: -1});
                    query.limit(reduce_count)
                        .exec((err, staffs) => {
                            if (staffs) {
                                const staff_count = staffs.length;
                                resolve(staffs);
                            } else {
                                reject('get staff by store_id fail')
                            }
                    })
                }else{
                    reject('no register');
                }
            })
        })
    },
};

module.exports = exports;
