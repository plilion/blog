/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-22
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('./db')('posts'),
    encrypto = require('../lib/util').encrypto,
    setting = require('../settings');
function Post(name,title,cat,tags,post){
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;
    this.cat = cat;
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
        id = encrypto(date.getTime()+this.post.length+''),
        post = {
            _id:id,
            name:this.name,
            title:this.title,
            cat:this.cat,
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
Post.update = function(post,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        var postid = post._id;
        delete post._id;
        db.update({'_id':postid},{$set:post},function(err){
            callback(err);
        });
    });
}
Post.read = function(id,callback){
    Post.getOne(id,callback);
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
            callback(null,docs);
        });
    });
}
Post.page = function(name,page,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        var query = {};
        if(name){
            query.name= name;
        }
        if(!page){page=1;}
        db.count(function(err,total){
            total = total?Math.ceil(total/setting.page):1;
            db.find(query,{skip:(page-1)*10,limit:setting.page}).sort({time:-1}).toArray(function(err,docs){
                if(err){
                    docs = [];
                }
                var isFirstPage = page == 1,
                    isLastPage = page == total;
                callback(null,docs,total,isFirstPage,isLastPage);
            });
        });
    });
}
Post.getArchive = function(callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.find({},{_id:1,name:1,title:1,time:1}).sort({time:-1}).toArray(function(err,docs){

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
        db.find({'tags.tag':tag},{_id:1,name:1,title:1,time:1}).sort({time:1}).toArray(function(err,docs){

            if(err){
                callback(err,null);
            }
            callback(null,docs);
        });
    });
}
Post.getOne = function(id,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.findOne({'_id':id},function(err,doc){
           if(err){
               return callback(err);
           }
            db.update({'_id':id},{$inc:{'pv':1}},function(err){});
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
        db.find({title:pattern},{_id:1,name:1,title:1,time:1}).sort({time:1}).toArray(function(err,posts){

           if(err){
               return callback(err,null);
           }
            callback(null,posts);
        });
    });
}