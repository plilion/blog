/**
 * User: philion
 * Date: 13-7-16
 * Time: 下午9:15
 */
var settings =  require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
Module.exports = new Db(settings.db,new Server(settings.host,Connection.DEFAULT_PORT,{}));