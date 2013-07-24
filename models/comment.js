/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-24
 * Time: 上午11:29
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('./db');
function Comment(name,day,title,comment){
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}
module.exports = Comment;
Comment.prototype.save = function(callback){
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findAndModify({'name':name,'time.day':day,'title':title},[['time',-1]],{$push:{'comments':comment}},{'new':true},function(err,comment){
                mongodb.close();
                callback(err || null);
            });
        });
    });
}