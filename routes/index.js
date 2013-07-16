
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user');
module.exports = function(app){
    app.get('/',function(req, res){
        res.render('index', { title: '首页',login:true });
    });
    app.get('/login',function(req,res){
        res.render('login',{title:'登录',login:false});
    });
    app.post('/login',function(req,res){

    });
    app.get('/reg',function(req,res){
        res.render('reg',{title:'注册',login:false});
    });
    app.post('/reg',function(req,res){
           var name = req.body.name,
               password = req.body.password,
               repassword = req.body.repassword;
    })
    app.get('/list/:id?',function(req,res){
        res.render('list',{title:'文章列表',login:false,post:[
            {id:1,title:'First Post',time:new Date().toString()}
        ]});
    });
    app.get('/post',function(req,res){
        res.render('post',{title:'发表',login:true});
    });
    app.post('/post',function(req,res){

    });
}