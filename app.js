var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var connect = require('connect');
var mongoStore = require('connect-mongo')(connect);
var _ = require('underscore');
var Movie = require('./models/movie');
var User = require('./models/user');
var port = process.env.PORT || 3000;
var app = express();
var dbUrl = 'mongodb://localhost:27017/moviedb';

mongoose.Promise = global.Promise;
//链接数据库
mongoose.connect(dbUrl);

app.set('views','./views/pages');
app.set('view engine','jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.locals.moment = require('moment');
app.use(express.cookieParser());
app.use(session({
	secret:'HAO123',
	store: new mongoStore({
		url:dbUrl
	})
}));
app.listen(port,'127.0.0.1');
console.log('moive started on port ' + port +'............');
//页面路由
app.get('/',function(req,res){
	// console.log('user in session: ');
	// console.log(req.session.user);
	Movie.fetch(function(err,movies){
		//异常处理
		if(err) console.log(err);
		//index page
		res.render('index',{
			title:'HAO123电影网 首页',
			movies:movies
		});
	});
});

//signup 注册
app.post('/user/signup',function (req,res){
	var _user = req.body.user;
	
	//查找数据库是否已经存当前注册的用户名
	User.findOne({name: _user.name},function (err,user){
		if(err){
			 console.log(err);
		}
		if(user){
			console.log(user);
			return res.redirect('/');
		}else{
			console.log(user);
			var user = new User(_user);
			user.save(function (err,user){
				if(err){
					console.log(err);
				}
		 		res.redirect('/admin/userlist');
			});
		}
	});
});

//userlist 用户列表
app.get('/admin/userlist',function(req,res){

	User.fetch(function(err,users){
		//异常处理
		if(err) console.log(err);
		res.render('userlist',{
			title: 'HAO123电影网-用户列表',
			users:users
		});
	});
});

//signin 用户登录
app.post('/user/signin',function(req,res){
	var _user= req.body.user;
	var name = _user.name;
	var password = _user.password;

	User.findOne({name:name},function(err,user){
		if(err) console.log(err);
		//如果用户不存在
		if(!user){
			return res.redirect('/');
		}
		//如果存在，比对密码
		user.comparePassword(password,function(err,isMatch){
			if(err) console.log(err);
			if(isMatch){
				// req.session.user = user;
				console.log('login success');
				return res.redirect('/');
			}else{
				console.log('password is erorr');
			}
		});
	});
});

app.get('/movie/:id',function(req,res){
	//获取页面当前id
	var id = req.params.id;

	Movie.findById(id,function(err,movie){
		//detail page
		res.render('detail',{
			title: 'HAO123电影网-'+movie.title,
			movie:movie
		});
	});
});
app.get('/admin/movie',function(req,res){
	//admin page
	res.render('admin',{
		title: 'HAO123电影网-后台录入页',
		movie:{
			title:'',
			doctor:'',
			country:'',
			year:'',
			poster:'',
			flash:'',
			summary:'',
			language:''
		}
	});
});

//admin update movie
app.get('/admin/update/:id',function(req,res){
	var id = req.params.id;
	if(id){
		Movie.findById(id,function(err,movie){

			res.render('admin',{
				title:'HAO123电影网-后台更新页',
				movie:movie
			});
		});
	}
});

//admin post movie
app.post('/admin/movie/new',function(req,res){
	    var id = req.body.movie._id;
	    var movieObj = req.body.movie;
	    var _movie ;
	    if(id!=='undefined' && id !== "" && id !== null){
	        Movie.findById(id,function (err,movie) {
	            if (err) {
	                console.log(err);
	            }

	            _movie = _.extend(movie, movieObj);
	            _movie.save(function (err,movie) {
	                if (err){
	                    console.log(err);
	                }
	                res.redirect('/movie/' + movie._id)
	            })
	        })
	    }else{
	        _movie = new Movie({
	            doctor:movieObj.doctor,
	            title:movieObj.title,
	            country:movieObj.country,
	            language:movieObj.language,
	            year:movieObj.year,
	            poster:movieObj.poster,
	            summary:movieObj.summary,
	            flash:movieObj.flash
	        });
	        _movie.save(function (err,movie) {
	            if (err){
	                console.log(err);
	            }
	            res.redirect('/movie/' + movie._id)
	        })
	    }
});

//list page
app.get('/admin/list',function(req,res){

	Movie.fetch(function(err,movies){
		//异常处理
		if(err) console.log(err);
		res.render('list',{
			title: 'HAO123电影网-列表页',
			movies:movies
		});
	});
});

//list delete movie
app.delete('/admin/list',function(req,res){
	//query获取请求的方式传过来的参数
	var id = req.query.id;
	if(id){
		Movie.remove({_id:id},function(err,movie){
			if(err) {
				console.log(err);
			}else{
				res.json({success:1});
			}
		});
	}
});