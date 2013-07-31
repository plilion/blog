var mongodb = require('./db')('user');
function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}
module.exports = User;

User.prototype.save = function(callback){
    var user = {
        name:this.name,
        password:this.password,
        email:this.email
    };
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.insert(user,{safe:true},function(err,user){

            callback(err,user);
        });
    });
}
User.get = function(name,callback){
    mongodb(function(err,db){
        if(err){
            return callback(err);
        }
        db.findOne({name:name},function(err,doc){

            if(doc){
               var user = new User(doc);
                callback(err,user);
            }else{
                callback(err,null);
            }

        });
    });
}