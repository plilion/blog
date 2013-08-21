/**
 * User: philion
 * Date: 13-8-18
 * Time: 下午4:44
 */
var Post = require('../models/post');

exports.cats = function(ep){
    Post.getTags(function(err,tags){
        if(err){
            tags = [];
        }
        ep.trigger('tags',tags);
    });
}
exports.tags = function(ep){
    Post.getCats(function(err,cats){
        if(err){
            cats = [];
        }
        ep.trigger('cats',cats);
    });
}
