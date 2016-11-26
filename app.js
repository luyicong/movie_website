var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./models/movie');
var port = process.env.PORT || 3000;
var app = express();

mongoose.Promise = global.Promise;
//链接数据库
mongoose.connect('mongodb://localhost:27017/moviedb');

app.set('views','./views/pages');
app.set('view engine','jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.locals.moment = require('moment')
app.listen(port);
console.log('moive started on port ' + port +'............');
//页面路由
app.get('/',function(req,res){
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
	// var id = req.body.movie._id;
	// var movieObj = req.body.movie;
	// var _movie;
	// if(id!=='undefined'){
	// 	Movie.findById(id,function(err,movie){
	// 		if(err){
	// 			console.log(err);
	// 		} 
	// 		_movie = _.extend(movie,movieObj)
	// 		_movie.save(function(err,movie){
	// 			if(err){
	// 				console.log(err);
	// 			} 
	// 			res.redirect('/movie/'+movie._id);
	// 		});
	// 	});
	// }else{
	// 	_movie = new Movie({
	// 		doctor:movieObj.doctor,
	// 		title:movieObj.title,
	// 		country:movieObj.country,
	// 		language:movieObj.language,
	// 		year:movieObj.year,
	// 		poster:movieObj.poster,
	// 		summary:movieObj.summary,
	// 		flash:movieObj.flash
	// 	});
	// 	_movie.save(function(err,movie){
	// 		if(err){
	// 			console.log(err);
	// 		}
	// 		res.redirect('/movie/' + movie._id);
	// 	});
	// }
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

app.get('/admin/list',function(req,res){

	Movie.fetch(function(err,movies){
		//异常处理
		if(err) console.log(err);
		//list page
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