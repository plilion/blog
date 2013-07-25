/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-22
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('./db'),
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
Post.getTen = function(name,page,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        var query = {};
        if(name){
            query.name= name;
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.count(function(err,total){
                collection.find(query,{skip:(page-1)*10,limit:10}).sort({time:-1}).toArray(function(err,docs){
                    mongodb.close();
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
    });
}
Post.getArchive = function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({},{name:1,title:1,time:1}).sort({time:-1}).toArray(function(err,docs){
               mongodb.close();
               if(err){
                   docs = [];
               }
               callback(null,docs);
            });
        });
    });
}
Post.getTags = function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                callback(err);
            }
            collection.distinct('tags.tag',function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err,null);
                }
                callback(null,docs);
            });
        });
    });
}
Post.getTag = function(tag,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({'tags.tag':tag},{name:1,title:1,time:1}).sort({time:1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    callback(err,null);
                }
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
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({'name':name,'title':title,'time.day':day},function(err,doc){
               mongodb.close();
               if(err){
                   return callback(err);
               }
               if(doc){
                   doc.post = markdown.toHTML(doc.post);
                   doc.comments.forEach(function(comment){
                       comment.content = markdown.toHTML(comment.content);
                   });
               }
               callback(err,doc);
            })
            collection.update({'name':name,'title':title,'time.day':day},{$inc:{'pv':1}});
        });
    });
}
Post.search = function(keyword,callback){

    mongodb.open(function(err,db){
        if(err){
            return callback(err)
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp('^.*'+keyword+'.*$','i');
            collection.find({title:pattern},{name:1,title:1,time:1}).sort({time:1}).toArray(function(err,posts){
                mongodb.close();
               if(err){
                   return callback(err,null);
               }
                callback(null,posts);
            });
        });

    });
}