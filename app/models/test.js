/*
 * Author:  Kain<kain@foowala.com>
 * Module description: 测试
 */


var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	test_Schema = new Schema({
		test: String
	});

test_Schema.virtual('date').get(() => {
	this._id.getTimestamp();
});

test_Schema.pre('save', (next) => {
	next();
});

test_Schema.statics = {
	findById: (_id, callback) => {
		this.findOne({
			_id: _id
		}, (err, test) => {
			callback(test);
		});
	}
}

mongoose.model('test', test_Schema, 'test');