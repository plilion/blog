/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-22
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */
var db = require('./db'),
    encrypto = require('../lib/util').encrypto,
    setting = require('../settings');
db.bind('posts');
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
        db.posts.insert(post,{safe:true},function(err,post){
            if(err){
                return callback(err);
            }
            callback(null);
        });
}
Post.update = function(post,callback){
        var postid = post._id;
        delete post._id;
        db.posts.update({'_id':postid},{$set:post},function(err){
            callback(err);
        });
}
Post.read = function(id,callback){
    Post.getOne(id,callback);
}
Post.getAll = function(name,callback){
        var query = {};
        if(name){
            query.name = name;
        }
        db.posts.find(query).sort({time:-1}).toArray(function(err,docs){

            if(err){
                return callback(err,null);
            }
            callback(null,docs);
        });
}
Post.page = function(condition,page,callback){
        var query = condition || {};
        if(!page){page=1;}
        db.posts.count(query,function(err,total){
            total = total?Math.ceil(total/setting.page):1;
            db.posts.find(query,{skip:(page-1)*10,limit:setting.page}).sort({time:-1}).toArray(function(err,docs){
                if(err){
                    docs = [];
                }
                var isFirstPage = page == 1,
                    isLastPage = page == total;
                callback(null,docs,total,isFirstPage,isLastPage);
            });
        });
}
Post.getArchive = function(callback){
        db.posts.find({},{_id:1,name:1,title:1,time:1}).sort({time:-1}).toArray(function(err,docs){

           if(err){
               docs = [];
           }
           callback(null,docs);
        });
}
Post.getCats = function(callback){
    db.posts.distinct('cat',function(err,docs){
        if(err){
            return callback(err,null);
        }
        callback(null,docs);
    });
}
Post.getTags = function(callback){
        db.posts.distinct('tags.tag',function(err,docs){

            if(err){
                return callback(err,null);
            }
            callback(null,docs);
        });
}
Post.getTag = function(tag,callback){
        db.posts.find({'tags.tag':tag},{_id:1,name:1,title:1,time:1}).sort({time:1}).toArray(function(err,docs){

            if(err){
                callback(err,null);
            }
            callback(null,docs);
        });
}
Post.getOne = function(id,callback){
        db.posts.findOne({'_id':id},function(err,doc){
           if(err){
               return callback(err);
           }
            db.posts.update({'_id':id},{$inc:{'pv':1}},function(err){});
           callback(err,doc);
        });
}
Post.search = function(keyword,callback){
        var pattern = new RegExp('^.*'+keyword+'.*$','i');
        db.posts.find({title:pattern},{_id:1,name:1,title:1,time:1}).sort({time:1}).toArray(function(err,posts){

           if(err){
               return callback(err,null);
           }
            callback(null,posts);
        });
}