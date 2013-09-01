/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午3:15
 * To change this template use File | Settings | File Templates.
 */
var blog = require('./routes/blog'),
    admin = require('./routes/admin');
module.exports = function(app){
    app.get('/',blog.index);
    app.get('/post/:postid',blog.post);
    app.post('/comment',blog.comment);
    app.get('/labs',blog.labs);

    app.get('/login',admin.login);
    app.post('/login',admin.login);

    app.get('/admin',admin.auth_user,admin.index);
    app.get('/admin/write',admin.auth_user,admin.write);
    app.post('/admin/write',admin.auth_user,admin.write);

   app.get('/admin/edit/:postid',admin.edit);
   app.post('/admin/edit/:postid',admin.edit);
   app.get('/admin/del/:postid',admin.postDel);

   app.get('/admin/lab',admin.auth_user,admin.lab);
   app.post('/admin/addLab',admin.auth_user,admin.addLab);
   app.get('/admin/labdel/:labid',admin.auth_user,admin.labDel);

   app.get('/404',blog.notFound);
   app.get('*',blog.notFound);
}