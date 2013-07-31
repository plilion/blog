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
    app.use('/admin',function(req,res,next){
        console.log(req);
        if(req.session.user){
            next();
        }else{
            res.redirect('/login');
        }
    });
    app.get('/',frontend.index);
//    app.get('/archive/:pid',frontend.archive);
//    app.get('/tags/:tag?',frontend.tag);

    app.get('/login',backend.login);
    app.post('/login',backend.login);

    app.get(/\/admin\/.*/,backend.index);
//    app.get('/admin/post',backend.post);
//    app.get('/admin/post/write',backend.write);
//    app.post('/admin/post/write',backend.write);
//    app.get('/admin/post/edit:pid',backend.edit);
//    app.post('/admin/post/edit:pid',backend.edit);
}