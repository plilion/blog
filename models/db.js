/**
 * User: philion
 * Date: 13-7-16
 * Time: 下午9:15
 */
var settings =  require('../settings'),
    Db = require('mongodb'),
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
//module.exports = new Db(settings.db,new Server(settings.host,Connection.DEFAULT_PORT,{}));
/**
 * @string table
 * @function callback
 */
module.exports = function(table,callback){
    Db.connect(settings.dburl,function(err,connect){
          if(err){
              return callback(err);
          }
        connect.collection(table,function(err,collection){
            if(err){
                return callback(err);
            }
            callback(err,collection);
        });

    });
}