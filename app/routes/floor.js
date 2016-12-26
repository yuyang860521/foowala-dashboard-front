/*
 * Author:  Magic<magic@foowala.com>
 * Module description: floor route
 */
'use strict';

const message = require('../helpers/message'),
    mongoose = require('mongoose'),
    objectId = require('objectid'),
    async   = require('async'),
    floor_mongo = mongoose.model('floor'),
    _desk = require('../services/desk.service');

const getFloor = (req, reply) => {
        const msg = new message(),
            num = req.query.number,
            credentials = req.auth.credentials,
            store_id = credentials.store_id;
        floor_mongo.find({ store_id: store_id }, (err, floor) => {
            if (err) {
                reply(msg.unsuccess('get floor fail'))
            }
            reply(msg.success('create floor success', floor))
        }).sort({number:1})
    },
    insertFloor = (req, reply) => {
        var msg = new message(),
            credentials = req.auth.credentials,
            store_id = credentials.store_id;
        floor_mongo.aggregate([{
            $match: {store_id:objectId(store_id)}
        },{
            $group: {
                _id: {number:"$number"},
                num: {$first: "$number"}
            }
        },{
            $sort: {
                num: 1
            }
        },{
            $project: {
                _id: 0,
                num: 1
            }
        }], (err, docs)=>{
            const docs_count = docs.length;
            let floors = [], count_arr = [], count = 0;
            async.each(docs, (doc, callback) => {
                let num = doc.num;
                count++;
                count_arr.push(count)
                floors.push(num);
                callback()
            }, err => {
                // const floor_arr = Array.minus(count_arr, count_arr);
                // console.log('floors', floors)
                // console.log('count_arr', count_arr)
                async.each(floors, (floor, cb)=>{
                    const index = count_arr.indexOf(floor);
                    if (index === -1) {
                        count_arr.push(floor)
                    }else{
                        count_arr.splice(index,1)
                    }
                    cb()
                }, err=>{
                    const floor_doc = new floor_mongo({
                        store_id: store_id,
                        number: count_arr[0] ? count_arr[0] : (docs_count + 1)
                    })
                    floor_doc.save((err, floor) => {
                        if (err) {
                            reply(msg.unsuccess('create floor fail'))
                        }else{
                            reply(msg.success('create floor success', floor))
                        }
                    })
                })
            })
        })
    },
    deleteFloor = (req, reply) => {
        const number   = req.payload.number,
              msg = new message(),
              credentials = req.auth.credentials,
              store_id = credentials.store_id;
        console.log(number)
        floor_mongo.where({ number: number })
            .findOneAndRemove((err, desk) => {
                // console.log(desk)
                if (err || !desk) {
                    reply(msg.unsuccess('delete floor fail'))
                }else{
                    _desk.deleteDeskByFloor(number)
                        .then(result => {
                            if (result) {
                                reply(msg.success('delete floor success'))
                            } else {
                                reply(msg.unsuccess('delete floor desks fail'))
                            }
                        })
                }
            });
    };


module.exports = [{
    method: 'get',
    path: '/floor',
    config: {
        handler: getFloor,
        description: '<p>get floor</p>',
    }
}, {
    method: 'post',
    path: '/floor',
    config: {
        handler: insertFloor,
        description: '<p>insert floor</p>',
        validate: {
            query: {
                store_id: '5762401281786a675b1fbc90',
            }
        },
    }
},{
    method: 'delete',
    path: '/floor',
    config: {
        handler: deleteFloor,
        description: '<p>delete floor</p>'
    }
}];
