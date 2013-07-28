
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

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only

  app.use(express.errorHandler());

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
