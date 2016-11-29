var mongoose = require('mongoose');
//密码加盐算法模块
var bcrypt = require('bcrypt-nodejs');
//加盐算法长度
var SLAT_WORK_FACTOR = 10;

//定义user集合的数据模型
var UserSchema = new mongoose.Schema({
	name:{
		//主键--唯一
		unique:true,
		type:String
	},
	password:String,
	meta:{
		createAt: {
			type: Date,
			default:Date.now()
		},
		updateAt:{
			type: Date,
			default: Date.now()
		}
	}
}); 

//pre--每次保存数据就调用这个方法
UserSchema.pre('save',function(next){
	var user = this;
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else{
		this.meta.updateAt = Date.now();
	}

	//密码加盐计算
	bcrypt.genSalt(SLAT_WORK_FACTOR,function(err,salt){

		if(err) return next(err);

		//密码hsah加密添加加盐算法结合
		bcrypt.hash(user.password,null,null,function(err,hash){

			if(err) return next(err);

			user.password = hash;

			next();
		});
	});
});
//添加实例方法
UserSchema.methods = {
	comparePassword: function(_password,callback){
		//bcrypt的compare方法进行密码比对
		bcrypt.compare(_password,this.password,function(err,isMatch){
			if(err) return callback(err);
			callback(null,isMatch);
		});
	}
}

//添加操作数据库的静态方法
UserSchema.statics = {
	//查询全部
	fetch:function(callback){
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(callback);
	},
	//通过某个id查询
	findById:function(id,callback){
		return this
			.findOne({_id:id})
			.exec(callback);
	}
}

module.exports = UserSchema;