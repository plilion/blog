
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user');
module.exports = function(app){
    app.get('/',function(req, res){
        res.render('index',{
            title: '首页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.get('/login',function(req,res){
        res.render('login',{title:'登录',login:false});
    });
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success','登出成功');
        res.redirect('/');
    });
    app.post('/login',function(req,res){
        var md5 = crypto.createHash('md5'),
            name = req.body.name,
            password = req.body.password;
        if(!name ){
            req.flash('error','请输入用户名');
            return res.redirect('/login');
        }
        if(!password){
            req.flash('error','请输入密码');
            return res.redirect('/login');
        }
        password = md5.update(password).digest('hex');
        User.get(name,function(err,user){
            if(!user){
                req.flash('error','用户不存在');
                return res.redirect('/login');
            }
            if(user.password != password){
                req.flash('error','密码错误');
                return req.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登陆成功');
            res.redirect('/');
        });
    });
    app.get('/reg',function(req,res){
        res.render('reg',{
            title:'注册',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/reg',function(req,res){
        var name = req.body.name,
            password = req.body.password,
            repassword = req.body.repassword;
        if(password != repassword){
            req.flash('error','两次输入密码不一致!');
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name:req.body.name,
            password:password,
            email:req.body.email
        });
        User.get(newUser.name,function(err,user){
           if(user){
               err = '用户已存在!';
           }
           if(err){
               req.flash('error',err);
               return res.redirect('/reg');
           }
            newUser.save(function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success','注册成功!');
                res.redirect('/');
            });
        });
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