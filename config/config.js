/**
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 配置文件
 */

const path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	env = process.env.NODE_ENV || 'production',
	config = {
		dev: {
			main: {
				port: 9023,
				labels: 'main'
			},
			root: rootPath,
			mongo: {
				// db: 'mongodb://10.111.110.144:27017/foowalapos',
				db: 'mongodb://10.111.110.67:27017/foowalapos'
			},
			wechat_api:{
				custom:'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='
			},
			wechat:{
				appID:'wxd62a2af068f0693a',
				appsecret: 'c40eb5ab81add3be6502f6b7f7d1d5dd',
				accesstoken:'uachTM8WOZlIpvZrg8LbMmxl2f0VSm1g_UYfABHKQANOFD6RfmDSXLcO0iIlGXq6C4bAG71vBtoyqG0k1aZyAFiSdk_KAbtPGUV1sRLTWz3-7SdkMl86nLGle0Bp3fUkQJTeAEALEO'
			},
			qr:{
				token:'http://wechatme.leanapp.cn/db/token',
				qrurl: 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=',
				ticketurl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=',
				userurl: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='
			},
			open_id:{
				kf: "oz-PQwkRBA8qkZzXLXnJsc_BM9iY"
			}
		},
		test: {
			main: {
				port: 9026,
				labels: 'main'
			},
			root: rootPath,
			wechat_api:{
				custom:'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='
			},
			mongo: {
				db: 'mongodb://ec2-54-222-232-3.cn-north-1.compute.amazonaws.com.cn:27017,ec2-54-222-167-240.cn-north-1.compute.amazonaws.com.cn:27017/foowalapos_test'
			},
			qr:{
				token:'http://wechatme.leanapp.cn/db/token',
				qrurl: 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=',
				ticketurl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=',
				userurl: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='
			},
			open_id:{
				kf: "oZwgxtxEtGx3_9cIKO4UxDiKVvCU",
				kf_zhengshi: "oZwgxtxEtGx3_9cIKO4UxDiKVvCU"
			}
		},
		production: {
			main: {
				port: 9026,
				labels: 'main'
			},
			root: rootPath,
			wechat_api:{
				custom:'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='
			},
			mongo: {
				db: 'mongodb://ec2-54-222-232-3.cn-north-1.compute.amazonaws.com.cn:27017,ec2-54-222-167-240.cn-north-1.compute.amazonaws.com.cn:27017/foowalapos'
			},
			qr:{
				token:'http://www.foowala.com/dashboard/token',
				qrurl: 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=',
				ticketurl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=',
				userurl: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='
			},
			open_id:{
				kf: "oZwgxtxEtGx3_9cIKO4UxDiKVvCU",
				kf_zhengshi: "oZwgxtxEtGx3_9cIKO4UxDiKVvCU"
			}
		}
	};

module.exports = config[env]
