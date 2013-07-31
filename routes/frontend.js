/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午3:25
 * To change this template use File | Settings | File Templates.
 */

var  Post = require('../models/post');
exports.index = function(req,res){
    var page = req.query.p?parseInt(req.query.p,10):1;
    Post.getTen(null,page,function(err,posts,total){
        if(err){
            posts = [];
        }
        res.render('index',{
            title: '首页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
            posts:posts,
            page:page,
            isFirstPage:(page == 1),
            isLastPage:(((page-1)*10)+posts.length) == total,
            total:Math.ceil(total/10)
        })
    });
}