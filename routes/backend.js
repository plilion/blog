/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午3:25
 * To change this template use File | Settings | File Templates.
 */

var User = require('../models/user'),
    util = require('../lib/util');
exports.login = function(req,res){
    if(req.method == 'GET'){
        return res.render('login',{title:'登录'});
    }
    if(req.method == 'POST'){
        var name = req.body.name,
            password = util.encrypto(req.body.password.trim());
        User.get(name,function(err,user){
            if(err){
                req.flash('error','无该用户');
                return res.redirect('/login');
            }
            if(user && user.password == password){
                req.session.user = user;
                req.flash('success','登陆成功');
                res.redirect('/');
            }else{
                req.flash('error','用户名或密码错误');
                res.redirect('/login');
            }
        });
    }
}
exports.index = function(req,res){
    res.render('post',{title:'后台管理'});
}