/**
 * User: philion
 * Date: 13-7-16
 * Time: 下午9:15
 */
var settings =  require('../settings'),
    Db = require('mongoskin').db(settings.dburl);
module.exports = Db;