
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  ,MongoServer = require('connect-mongo')(express)
  ,settings = require('./settings')
  ,flash = require('connect-flash');

var app = express();
 //static file
var admin_public = __dirname+'/views/admin/public',
    theme_public = __dirname+'/views/theme/'+settings.theme+'/public';
app.use('/admin',express.static(admin_public));
app.use('/theme',express.static(theme_public));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.favicon(__dirname + '/public/favicon.ico'));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.compress());
app.use(flash());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key:settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 },//30 days
    store:new MongoServer({
      url:settings.dburl
    })
}));

app.use(function(req,res,next){
    if(req.session.user){
        req.flash('user',req.session.user);
    }
    next();
});
app.use(app.router);

// development only
app.configure('development',function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
})


routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
