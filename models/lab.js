/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-22
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */
var db = require('./../lib/db'),
    setting = require('../settings');
db.bind('labs');
function Lab(name,title,cat,tags,post){
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;
    this.cat = cat;
}
module.exports = Lab;
Lab.prototype.save = function(callback){
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
Lab.update = function(post,callback){
    var postid = post._id;
    delete post._id;
    db.posts.update({'_id':db.ObjectID.createFromHexString(postid)},{$set:post},function(err){
        callback(err);
    });
}
Lab.read = function(id,callback){
    Lab.getOne(id,callback);
}
Lab.getAll = function(name,callback){
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
Lab.page = function(condition,page,callback){
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
Lab.getArchive = function(callback){
    db.posts.find({},{_id:1,name:1,title:1,time:1}).sort({time:-1}).toArray(function(err,docs){

        if(err){
            docs = [];
        }
        callback(null,docs);
    });
}
Lab.getCats = function(callback){
    db.posts.distinct('cat',function(err,docs){
        if(err){
            return callback(err,null);
        }
        callback(null,docs);
    });
}
Lab.getTags = function(callback){
    db.posts.distinct('tags.tag',function(err,docs){
        console.log(docs);
        if(err){
            return callback(err,null);
        }
        callback(null,docs);
    });
}
Lab.getTag = function(tag,callback){
    db.posts.find({'tags.tag':tag},{_id:1,name:1,title:1,time:1}).sort({time:1}).toArray(function(err,docs){

        if(err){
            callback(err,null);
        }
        callback(null,docs);
    });
}
Lab.getOne = function(id,callback){
    db.posts.findOne({'_id':db.ObjectID.createFromHexString(id)},function(err,doc){
        if(err){
            return callback(err);
        }
        db.posts.update({'_id':db.ObjectID.createFromHexString(id)},{$inc:{'pv':1}},function(err){});
        callback(err,doc);
    });
}
Lab.search = function(keyword,callback){
    var pattern = new RegExp('^.*'+keyword+'.*$','i');
    db.posts.find({title:pattern},{_id:1,name:1,title:1,time:1}).sort({time:1}).toArray(function(err,posts){

        if(err){
            return callback(err,null);
        }
        callback(null,posts);
    });
}