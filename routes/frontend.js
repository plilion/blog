/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午3:25
 * To change this template use File | Settings | File Templates.
 */

var marked = require('marked'),
    Post = require('../models/post'),
      Comment = require('../models/comment');

exports.index = function(req,res){
    var page = req.query.p?parseInt(req.query.p,10):1;
    Post.page(null,page,function(err,posts,total,isFirstPage,isLastPage){
        if(err){
            posts = [];
            total = 1;
        }
        posts.forEach(function(post){
            post.post = marked(post.post);
        });
        var data = {
            title:'后台管理',
            posts:posts,
            page:page,
            total:total,
            isFirstPage:isFirstPage,
            isLastPage:isLastPage
        }
        res.render('index',data);
    });
}
exports.post = function(req,res){
    var postid = req.params.postid;
    Post.getOne(postid,function(err,post){
        if(err){
            return res.render('404');
        }
        post.post =  marked(post.post);
        res.render('post',{
            title:post.title,
            post:post
        });
    });
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