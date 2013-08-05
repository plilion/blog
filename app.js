
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

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash())
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key:settings.db,

    store:new MongoServer({
      url:settings.dburl
    })
}));
var admin_public = __dirname+'/views/admim/public',
    theme_public = __dirname+'/views/theme/'+settings.theme+'/public';
app.use('/admin/public',express.static(admin_public));
app.use('/theme/public',express.static(theme_public));
app.use(express.static(path.join(__dirname,'public')));
app.use(app.router);

// development only
app.configure('development',function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
})


routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
