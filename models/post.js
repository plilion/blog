/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-22
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('./db'),
    markdown = require('markdown').markdown;
function Post(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;
Post.prototype.save = function(callback){
    var date = new Date(),
        time = {
            date:date,
            year:date.getFullYear(),
            month:(date.getFullYear())+'-'+(date.getMonth()+1),
            day:(date.getFullYear())+'-'+(date.getMonth()+1)+date.getDate(),
            minute:(date.getFullYear())+'-'+(date.getMonth()+1)+date.getDate()+' '+date.getHours()+':'+date.getMinutes()
        },
        post = {
            name:this.name,
            title:this.title,
            time:time,
            post:this.post
        };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(post,{safe:true},function(err,post){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                mongodb.close();
                callback(null);
            });
        });
    });
}
Post.getAll = function(name,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            collection.find(query).sort({time:-1}).toArray(function(err,docs){
                 mongodb.close();
                if(err){
                    return callback(err,null);
                }
                docs.forEach(function(doc){
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null,docs);
            });
        });
    });
}
Post.getOne = function(name,title,day,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.connection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({name:name,title:title,day:day},function(err,doc){
               mongodb.close();
               if(err){
                   return callback(err);
               }
               doc.post = markdown.toHTML(doc.post);
               callback(err,doc);
            });
        });
    });
}