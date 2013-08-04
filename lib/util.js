/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午5:53
 * To change this template use File | Settings | File Templates.
 */


var crypto = require('crypto');

exports.encrypto = function(str){
    var md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex')
}
exports.formatNum = function(num,bit){
    return (parseInt(num,10)/Math.pow(10,bit)).toFixed(bit).slice(bit);
}