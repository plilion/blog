/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午3:25
 * To change this template use File | Settings | File Templates.
 */

var User = require('../models/user'),
    Post = require('../models/post'),
    Lab = require('../models/lab'),
    util = require('../lib/util'),
    marked = require('marked'),
    eventproxy = require('eventproxy');
exports.login = function(req,res){
    if(req.method == 'GET'){
        if(req.session.user){
            return res.redirect('/admin');
        }
        return res.render('admin/login',{title:'登录'});
    }
    if(req.method == 'POST'){
        var name = req.body.name,
            password = util.encrypto(req.body.password.trim());
        User.get(name,function(err,user){
            if(err){
                req.flash('error','无该用户');
                return res.redirect('/login');
            }
            if(user && user.password == password){
                req.session.user = user;
                req.flash('success','登陆成功');
                res.redirect('/admin');
            }else{
                req.flash('error','用户名或密码错误');
                res.redirect('/login');
            }
        });
    }
}
exports.auth_user = function(req,res,next){
    if(req.session.user){
        next();
    }else{
        return res.redirect('/login');
        //req.session.user = {name:'111'};
    }

}
exports.index = function(req,res){
    var page = req.query.p?parseInt(req.query.p,10): 1,
        name = req.session.user.name;
    Post.page({name:name},page,function(err,posts,total,isFirstPage,isLastPage){
        var data = {
            title:'后台管理',
            posts:posts,
            page:page,
            total:total,
            isFirstPage:isFirstPage,
            isLastPage:isLastPage
        }
        if(err){
            console.log(err);
            data.posts = [];
            data.total = 1;
        }
        res.render('admin/index',data);
    });
}
exports.write = function(req,res){
    if(req.method == 'GET'){
        res.render('admin/write',{title:'后台管理'});
    }
    if(req.method == 'POST'){
        var user = req.session.user,
            tags = [];
        req.body.tags.split(',').forEach(function(tag){
            if(tag){
                tags.push({'tag':tag});
            }
        });
        var post = new Post(req.body.author||user.name,req.body.title,req.body.cat,tags,req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/admin');
            }
            req.flash('success','发布成功');
            res.redirect('/admin');
        });
    }
}
exports.edit = function(req,res){
        if(req.method == 'GET'){
            Post.getOne(req.params.postid,function(err,post){
                if(err){
                    req.flash('error',err);
                    return res.redirect('back');
                }
                var tags = [];
                post.tags.forEach(function(tag){
                    tags.push(tag.tag);
                });

                post.tags = tags.join(',');
                res.render('admin/edit',{
                    title:post.title,
                    post:post
                });
            });
        }
        if(req.method == 'POST'){
            var postid = req.body.postid,
                title = req.body.title,
                cat = req.body.cat,
                post = req.body.post,
                tags = [];
            req.body.tags.split(',').forEach(function(tag){
                tags.push({tag:tag});
            });
            Post.update({
                _id:postid,
                title:title,
                cat:cat,
                post:post,
                tags:tags
            },function(err){
                 if(err){
                     req.flash('error',err);
                     return res.redirect('back');
                 }
                 req.flash('success','修改成功');
                res.redirect('/admin');
            });
        }
}


exports.lab = function(req,res){
    var data = {
        title:'实验室',
        page:1,
        total:1,
        isFirstPage:1,
        isLastPage:1
    }
    res.render('admin/lab',data);
}
exports.addLab = function(req,res){
    res.send('ok');
}