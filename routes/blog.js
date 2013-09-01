/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午3:25
 * To change this template use File | Settings | File Templates.
 */

var marked = require('marked'),
    Post = require('../models/post'),
    Side = require('./side'),
    Comment = require('../models/comment'),
    eproxy = require('eventproxy'),
    theme =  'theme/'+require('../settings').theme+'/';

exports.index = function(req,res){
    var page = req.query.p?parseInt(req.query.p,10): 1,
        ep = new eproxy();
    ep.all('posts','tags','cats',function(posts,tags,cats){
        posts.tags = tags;
        posts.cats = cats;
        res.render(theme+'index',posts);
    });
    Post.page(null,page,function(err,posts,total,isFirstPage,isLastPage){
        if(err){
            posts = [];
            total = 1;
        }
        var index,view;
        posts.forEach(function(post){
            post.post = marked(post.post.split('<!--more-->')[0]);
        });
        var data = {
            title:'首页',
            posts:posts,
            page:page,
            total:total,
            isFirstPage:isFirstPage,
            isLastPage:isLastPage
        }
        ep.trigger('posts',data);
    });
    Side.cats(ep);
    Side.tags(ep);

}
exports.post = function(req,res){
    var postid = req.params.postid,
        ep = new eproxy();
    ep.all('post','tags','cats',function(posts,tags,cats){
        posts.tags = tags;
        posts.cats = cats;
        res.render(theme+'post',posts);
    });;
    Post.getOne(postid,function(err,post){
        if(err){
            return res.redirect('/404');
        }
        post.post =  marked(post.post);
        req.flash('crumbs',[['\/cat\/'+post.cat,post.cat],[post.title]]);
        ep.trigger('post',{
            title:post.title,
            post:post,
            crumbs:req.flash('crumbs')
        });
    });
    Side.cats(ep);
    Side.tags(ep);
}
exports.comment = function(req,res){
       var name = req.body.name,
           email = req.body.email,
           website = req.body.website,
           postid = req.body.postid,
           parentid = req.body.parentid,
           content = req.body.content,
           comment = new Comment(postid,parentid,name,email,website,content);
       comment.save(function(err){
           if(err){
               req.flash('error',error);
               res.redirect('back');
           }
           req.flash('success','留言成功');
           res.redirect('back');
       });

}
exports.labs = function(req,res){
    res.render(theme+'labs',{
        title:'实验室'
    });
}
exports.notFound = function(req,res){
    res.render(theme+'404')
}