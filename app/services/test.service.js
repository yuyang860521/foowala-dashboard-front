/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: test
 */

var async 	   = require('async'),
	mongoose   = require('mongoose'),
	test_mongo = mongoose.model('test');


var exports = {

	insert(callback) {

		var model = new test_mongo({
			test: 'ok'
		})

		model.save((err) => {
			console.log('ok')
			console.log(err)
			callback()
		})
	}

	getTest(callback) {
		test_mongo.find({}).exec((err, test) => {
			console.log(err)
			callback(test)
		})
	}
};

module.exports = exports;