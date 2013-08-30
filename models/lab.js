/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-22
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */
var db = require('./../lib/db'),
    setting = require('../settings'),
    EventProxy = require('eventproxy'),
    fs = require('fs'),
    path = require('path');
db.bind('labs');
function saveLabFile (labDir,files,callback){
    var labDir = setting.labs+labDir,
        ep = new EventProxy();
    ep.after('saved',files.length,function(){
        callback(null);
    });
    ep.on('save',function(){
        var  targetPaht = labDir+'/';
        files.forEach(function(file){
            fs.rename(file.path,targetPaht+file.name,function(err){
                if(err){
                    ep.trigger('error',err);
                }
                fs.unlink(file.path,function(err){
                    if(err){
                        ep.trigger('error',err);
                    }
                    ep.trigger('saved');
                });
            });
        });
    });
    ep.on('error',function(err){
        callback(err);
    });
    path.exists(labDir,function(exists){
        if(!exists){
            fs.mkdir(labDir,function(err){
                if(err){
                    ep.trigger('error',err);
                }
                ep.trigger('save');
            });
        }else{
            ep.trigger('save');
        }
    });
}
function Lab(title,cat,des,files){
    this.title = title;
    this.files = files;
    this.des = des;
    this.cat = cat;
}
module.exports = Lab;
Lab.prototype.save = function(callback){
    var date = new Date(),
        time =  new Date(),
        lab = {
            title:this.title,
            cat:this.cat,
            des:this.des,
            time:time,
            files:this.files,
            comments:[]
        },
        labDir = './public/labs/'+lab.title,
        ep = new EventProxy();
    ep.on('saved',function(){
        lab.path = labDir;
        delete lab.files;
        db.labs.insert(lab,{safe:true},function(err){
            if(err){
                ep.trigger('error',err);;
            }else{
                callback(null);
            }
        });
    });
    ep.on('error',function(err){
        callback(err);
    });
    saveLabFile(lab.title,lab.files,function(err){
        if(err){
            ep.trigger('error',err);
        }else{
            ep.trigger('saved')
        }
    });
}
Lab.update = function(lab,callback){
    var labid = lab._id;
    delete lab._id;
    saveLabFile(lab.title,lab.files,function(err){
        if(err){
            callback(err);
        }else{
            delete lab.files;
            db.labs.update({'_id':db.ObjectID.createFromHexString(labid)},{$set:lab},function(err){
                callback(err);
            });
        }
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
    db.labs.find(query).sort({time:-1}).toArray(function(err,docs){

        if(err){
            return callback(err,null);
        }
        callback(null,docs);
    });
}
Lab.page = function(condition,page,callback){
    var query = condition || {};
    if(!page){page=1;}
    db.labs.count(query,function(err,total){
        total = total?Math.ceil(total/setting.page):1;
        db.labs.find(query,{skip:(page-1)*10,limit:setting.page}).sort({time:-1}).toArray(function(err,docs){
            if(err){
                docs = [];
            }
            var isFirstPage = page == 1,
                isLastPage = page == total;
            callback(null,docs,total,isFirstPage,isLastPage);
        });
    });
}
Lab.del = function(id,callback){
    var ep = new EventProxy();
    ep.on('error',function(error){
        callback(error);
    });
    ep.on('lab',function(lab){
        fs.rmdir(lab.path,function(err){
            if(err){
                ep.trigger('error',err);
            }else{
                db.labs.remove({'_id':lab._id},function(err,result){
                    if(err){
                        ep.trigger('error',err);
                    }else{
                        console.log(result);
                        callback(null,result);
                    }
                });
            }
        });
    });
    Lab.getOne(id,function(err,lab){
        if(err){
            ep.trigger('error',err);
        }else{
            ep.trigger('lab',lab);
        }

    });
}
Lab.getCats = function(callback){
    db.labs.distinct('cat',function(err,docs){
        if(err){
            return callback(err,null);
        }
        callback(null,docs);
    });
}

Lab.getOne = function(id,callback){
    db.labs.findOne({'_id':db.ObjectID.createFromHexString(id)},function(err,doc){
        if(err){
            return callback(err);
        }
        db.labs.update({'_id':db.ObjectID.createFromHexString(id)},{$inc:{'pv':1}},function(err){});
        callback(err,doc);
    });
}
Lab.search = function(keyword,callback){
    var pattern = new RegExp('^.*'+keyword+'.*$','i');
    db.labs.find({title:pattern,des:pattern},{_id:1,name:1,title:1,time:1}).sort({time:1}).toArray(function(err,posts){

        if(err){
            return callback(err,null);
        }
        callback(null,posts);
    });
}