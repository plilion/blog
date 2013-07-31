/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-22
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('./db')('posts'),
    markdown = require('markdown').markdown;
function Post(name,title,tags,post){
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;
}
module.exports = Post;
Post.prototype.save = function(callback){
    var date = new Date(),
        time = {
            date:date,
            year:date.getFullYear(),
            month:(date.getFullYear())+'-'+(date.getMonth()+1),
            day:(date.getFullYear())+'-'+(date.getMonth()+1)+'-'+date.getDate(),
            minute:(date.getFullYear())+'-'+(date.getMonth()+1)+date.getDate()+' '+date.getHours()+':'+date.getMinutes()
        },
        post = {
            name:this.name,
            title:this.title,
            tags:this.tags,
            time:time,
            post:this.post,
            comments:[]
        };
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.insert(post,{safe:true},function(err,post){
            if(err){
                return callback(err);
            }
            callback(null);
        });
    });
}
Post.update = function(name,title,day,post,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.update({'name':name,'title':title,'time.day':day},{$set:{post:post}},function(err){
            callback(err);
        });
    });
}
Post.read = function(name,title,day,callback){
    Post.getOne(name,title,day,callback);
}
Post.getAll = function(name,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        var query = {};
        if(name){
            query.name = name;
        }
        db.find(query).sort({time:-1}).toArray(function(err,docs){

            if(err){
                return callback(err,null);
            }
            docs.forEach(function(doc){
                doc.post = markdown.toHTML(doc.post);
            });
            callback(null,docs);
        });
    });
}
Post.getTen = function(name,page,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        var query = {};
        if(name){
            query.name= name;
        }
        db.count(function(err,total){
            db.find(query,{skip:(page-1)*10,limit:10}).sort({time:-1}).toArray(function(err,docs){

                if(err){
                    docs = [];
                }
                docs.forEach(function(doc){
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null,docs,total);
            });
        });
    });
}
Post.getArchive = function(callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.find({},{name:1,title:1,time:1}).sort({time:-1}).toArray(function(err,docs){

           if(err){
               docs = [];
           }
           callback(null,docs);
        });
    });
}
Post.getTags = function(callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.distinct('tags.tag',function(err,docs){

            if(err){
                return callback(err,null);
            }
            callback(null,docs);
        });
    });
}
Post.getTag = function(tag,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.find({'tags.tag':tag},{name:1,title:1,time:1}).sort({time:1}).toArray(function(err,docs){

            if(err){
                callback(err,null);
            }
            callback(null,docs);
        });
    });
}
Post.getOne = function(name,title,day,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.findOne({'name':name,'title':title,'time.day':day},function(err,doc){
           if(err){
               return callback(err);
           }
           if(doc){
               doc.post = markdown.toHTML(doc.post);
               doc.comments.forEach(function(comment){
                   comment.content = markdown.toHTML(comment.content);
               });
           }
            db.update({'name':name,'title':title,'time.day':day},{$inc:{'pv':1}},function(err){
                console.log(title+'read one time');
            });
           callback(err,doc);
        });
    });
}
Post.search = function(keyword,callback){

    mongodb(function(err,db){
        if(err){
            return callback(err)
        }
        var pattern = new RegExp('^.*'+keyword+'.*$','i');
        db.find({title:pattern},{name:1,title:1,time:1}).sort({time:1}).toArray(function(err,posts){

           if(err){
               return callback(err,null);
           }
            callback(null,posts);
        });
    });
}