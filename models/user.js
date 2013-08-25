var db = require('./../lib/db');
function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}
db.bind('user');
module.exports = User;

User.prototype.save = function(callback){
    var user = {
        name:this.name,
        password:this.password,
        email:this.email
    };
    db.user.insert(user,{safe:true},function(err,user){

        callback(err,user);
    });
}
User.get = function(name,callback){
        db.user.findOne({name:name},function(err,doc){
            if(doc){
               var user = new User(doc);
                callback(err,user);
            }else{
                callback(err,null);
            }

        });
}