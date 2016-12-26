/*
 * Author: Magic <magic@foowala.com>
 * Module description: uid
 */

var async = require('async'),
    mongoose = require('mongoose'),
    objectid = require('objectid'),
    _work  = require('./work.service'),
    uid_mongo = mongoose.model('uid');

var exports = {
    saveUid(data) {
        const uid = data.uid,
            open_id = data.open_id,
            isLogin = data.isLogin,
            isStaff = data.isStaff,
            staff_id = data.staff_id,
            nickname = data.nickname;
        console.log('data', data)
        return new Promise((resolve, reject) => {
            //save
            uid_mongo.findOne({ uid: uid }, (err, result) => {
                if (err) { reject('save uid err') }
                if (result) {
                    result.staff_id = staff_id;
                    result.scene = "login";
                    result.open_id=open_id;
                    result.isLogin= isLogin;
                    result.isStaff= isStaff;
                    result.nickname= nickname;
                    console.log('result', result)
                    result.save(err => {
                        if (err) { reject('save uid err') }
                        return resolve(result)
                        // if (isLogin === 1) {
                        //     _work.intoWork(staff_id, (bo, res)=>{
                        //         if (bo) {
                        //             // return resolve(uid_doc)
                        //             return resolve(result)
                        //         }
                        //     })
                        // }
                    })
                } else {
                    const uid_doc = new uid_mongo({
                        uid: uid,
                        staff_id:staff_id,
                        scene   : "login",
                        open_id: open_id,
                        isLogin: isLogin,
                        isStaff: isStaff,
                        nickname: nickname
                    })
                    console.log('uid_doc', uid_doc)
                    uid_doc.save(err => {
                        if (err) { reject('save uid err') }
                        return resolve(uid_doc)
                            // _work.intoWork(staff_id, (bo, res)=>{
                            //     if (bo) {
                            //         return resolve(uid_doc)
                            //     }
                            // })
                    })
                }
            })
        })
    },

    getUid(uid) {
        return new Promise((resolve, reject) => {
            uid_mongo.findOne({ uid: uid }, (err, uid) => {
                if (uid) {
                    const isLogin = uid.isLogin;
                    const staff_id = uid.staff_id;
                    _work.intoWork(staff_id, (bo, result) => {
                        resolve(uid)
                    })
                    // resolve(uid)
                } else {
                    reject('no uid')
                }
            });
        });
    }
};

module.exports = exports;
