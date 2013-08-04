/**
 * Created with JetBrains WebStorm.
 * User: zhang.yt
 * Date: 13-7-29
 * Time: 下午3:15
 * To change this template use File | Settings | File Templates.
 */
var frontend = require('./routes/frontend'),
    backend = require('./routes/backend');
module.exports = function(app){
    app.get('/',frontend.index);
    app.get('/post/:postid',frontend.post);
    app.post('/comment',frontend.comment);
//    app.get('/tags/:tag?',frontend.tag);

    app.get('/login',backend.login);
    app.post('/login',backend.login);

    app.get('/admin',backend.auth_user,backend.index);
    app.get('/admin/write',backend.auth_user,backend.write);
    app.post('/admin/write',backend.auth_user,backend.write);

   app.get('/admin/edit/:postid',backend.edit);
   app.post('/admin/edit/:pid',backend.edit);
   app.get('*',function(req,res){
        res.render('404');
    })
}