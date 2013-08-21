/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-24
 * Time: 上午11:29
 * To change this template use File | Settings | File Templates.
 */
var db = require('./db'),
    util = require('../lib/util'),
    encrypto = util.encrypto,
    formatNum = util.formatNum;
db.bind('posts');
function Comment(postid,parentid,name,email,website,content){
    var date = new Date();
    this.postid = postid;
    this.parentid = parentid;
    this.name = name;
    this.email = email;
    this.website = website;
    this.content = content;
    this.time = (date.getFullYear())+'-'+formatNum((date.getMonth()+1),2)+'-'+formatNum(date.getDate(),2)+' '+formatNum(date.getHours(),2)+':'+formatNum(date.getMinutes(),2);
}
module.exports = Comment;
Comment.prototype.save = function(callback){
    var postid = this.postid,
        id = encrypto(this.time+this.content.length+''),
        name = this.name,
        email = this.email,
        website = this.website,
        content = this.content,
        time = this.time,
        parentid = this.parentid;

        var comment = {
            _id:id,
            name:name,
            email:email,
            website:website,
            content:content,
            time:time
        };
        if(parentid){comment.parentid = parentid;}
        db.posts.findAndModify({_id:postid},[['time',-1]],{$push:{'comments':comment}},{'new':true},function(err){
            callback(err || null);
        });
}