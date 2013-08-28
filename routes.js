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
//    app.get('/tags/:tag?',blog.tag);

    app.get('/login',admin.login);
    app.post('/login',admin.login);

    app.get('/admin',admin.auth_user,admin.index);
    app.get('/admin/write',admin.auth_user,admin.write);
    app.post('/admin/write',admin.auth_user,admin.write);

   app.get('/admin/edit/:postid',admin.edit);
   app.post('/admin/edit/:pid',admin.edit);

   app.get('/admin/lab',admin.auth_user,admin.lab);
   app.post('/admin/addLab',admin.auth_user,admin.addLab);

   app.get('/404',blog.notFound);
   app.get('*',blog.notFound);
}