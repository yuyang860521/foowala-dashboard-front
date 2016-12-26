/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 菜单
 */

'use strict';

const message = require('../helpers/message'),
    qs = require('qs'),
    _label = require('../services/label.service'),
    async = require('async');

// const Promise = require('bluebird');
// const  _label = Promise.promisifyAll(require('../services/label.service'));

const getlabelbyStore = (req, reply) => {
    const credentials = req.auth.credentials,
          store_id = credentials.store_id,
          msg = new message();

    _label.getlabelbyStore(store_id)
        .then((data) => {
            let labels = [];
            data.forEach((data, index, array) => {
                let lab = {};
                lab._id = data._id;
                lab.label = data.label;
                labels.push(lab);
            })
            reply(msg.success('get labels success', labels));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('get labels fail', err));
        })
};

const getlabelbyMenu = (req, reply) => {
    const credentials = req.auth.credentials,
          store_id = credentials.store_id,
          menu_id = req.params.menu_id,
          msg = new message();
        _label.getLabelByMenu(store_id, menu_id)
        .then((data) => {
            reply(msg.success('get labels success', data));
        });
}

const insertlabel = (req, reply) => {
    const msg = new message(),
        payload = JSON.parse(req.payload),
        label = payload.label,
        credentials = req.auth.credentials,
        store_id = credentials.store_id;
    if (Array.isArray(label)) {
        _label.insertArr(label, store_id)
            .then((data) => {
                reply(msg.success('success', data));
            })
            .catch(err => {
                console.error(err);
            })
    } else {
        _label.insert(label, store_id)
        .then((data) => {
            reply(msg.success('success', data));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('unsuccess', null));
        })
    }
};

const deleteLabel = (req, reply) => {
    const msg = new message(),
        _id = req.params._id;
    _label.delete(_id)
        .then(result => {
            reply(msg.success('success'), result);
        })
        .catch(err => {
            console.error(err);
        })

};

module.exports = [{
    method: 'get',
    path: '/store/label',
    config: {
        handler: getlabelbyStore,
        description: '<p>得到门店中的所有备注！</p>'
    }
}, {
    method: 'get',
    path: '/store/label/menu/{menu_id}',
    config: {
        handler: getlabelbyMenu,
        description: '<p>得到门店菜单备注！</p>'
    }
}, {
    method: 'post',
    path: '/store/label',
    config: {
        handler: insertlabel,
        description: '<p>insert label to store</p>',
        validate: {
            query: {
                store_id: '5762401281786a675b1fbc90',
                label: ' Array'
            }
        },
    }
}, {
    method: 'delete',
    path: '/store/label/{_id}',
    config: {
        handler: deleteLabel,
        description: '<p>delete label to store</p>',
        validate: {
            query: {
                store_id: '5762401281786a675b1fbc90',
                label: ' Array'
            }
        },
    }
}];
