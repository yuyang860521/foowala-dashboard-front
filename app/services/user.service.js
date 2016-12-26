/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 桌号
 */

const async = require('async'),
    mongoose = require('mongoose'),
    objectid = require('objectid'),
    user_mongo = mongoose.model('user');

const userservice = {
    insert: (user) => {
        return new Promise((reject, resolve) => {
            const query = user_mongo.find({ open_id: user.open_id, nickname: user.nickname });
            const promise = query.exec();
            promise.then(function(user) {
                if (user) {
                    reject('already has this user!');
                } else {
                    let newuser = new user_mongo({
                        open_id: user.open_id,
                        nickname: user.nickname,
                        password: user.password,
                        admin: user.admin
                    });
                    newuser.save((doc) =>{
                      resolve(doc);
                    })
                }
            })
        });
    }
};

module.exports = exports = userservice;
