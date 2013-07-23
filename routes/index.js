
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user'),
    Post = require('../models/post');
module.exports = function(app){
    app.get('/',function(req, res){
        Post.getAll(null,function(err,posts){
            if(err){
                posts = [];
            }
            res.render('index',{
                title: '首页',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                posts:posts
            })
        });
    });
    app.get('/u/:name',function(req,res){
         User.get(req.params.name,function(err,user){
             if(!user){
                 req.flash('error','用户不存在');
                 req.redirect('/');
             }
             Post.getAll(user.name,function(err,posts){
                 if(err){
                     posts = [];
                 }
                 res.render('user',{
                     title:user.name+'`s文章',
                     user:req.session.user,
                     success:req.flash('success').toString(),
                     error:req.flash('error').toString(),
                     posts:posts
                 });
             });
         });
    });
    app.get('/login',checkNotLogin);
    app.get('/login',function(req,res){
        res.render('login',{title:'登录',login:false});
    });

    app.post('/login',checkNotLogin);
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
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登陆成功');
            res.redirect('/');
        });
    });
    app.get('/logout',checkLogin);
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success','登出成功');
        res.redirect('/');
    });
    app.get('/reg',checkNotLogin);
    app.get('/reg',function(req,res){
        res.render('reg',{
            title:'注册',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });
    app.post('/reg',checkNotLogin);
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
        res.render('list',{title:'文章列表',post:[
            {id:1,title:'First Post',time:new Date().toString()}
        ]});
    });
    app.get('/post',checkLogin);
    app.get('/post',function(req,res){
        res.render('post',{title:'发表'});
    });
    app.post('/post',checkLogin);
    app.post('/post',function(req,res){
        var user = req.session.user,
            post = new Post(req.body.name||user.name,req.body.title,req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/post');
            }
            req.flash('success','发布成功');
            res.redirect('/');

        });
    });
    function checkLogin(req,res,next){
        if(!req.session.user){
            req.flash('error','未登录');
            res.redirect('/login');
        }
        next();
    }
    function checkNotLogin(req,res,next){
        if(req.session.user){
            req.flash('error','已登录');
            res.redirect('/');
        }
        next();
    }
}