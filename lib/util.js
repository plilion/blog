/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午5:53
 * To change this template use File | Settings | File Templates.
 */


var md5 = require('crypto').createHash('md5');

exports.encrypto = function(str){
    return md5.update(str).digest('hex')
}