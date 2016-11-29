var mongoose = require('mongoose');

//定义movie集合的数据模型
var MovieSchema = new mongoose.Schema({
	doctor:String,
	title:String,
	language:String,
	country:String,
	summary:String,
	flash:String,
	poster:String,
	year:Number,
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
MovieSchema.pre('save',function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else{
		this.meta.updateAt = Date.now();
	}
	next();
});

//添加操作数据库的静态方法
MovieSchema.statics = {
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

module.exports = MovieSchema;