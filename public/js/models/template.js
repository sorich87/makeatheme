/**
 * A template can be one of the following:
 * filename : Name
 * index.html : Default
 * front-page.html : Front Page
 * home.html : Blog
 * single.html : Post
 * page.html : Page
 * archive.html : Archive
 * search.html : Search Result
 * 404.html : Error 404
 */
define([
  "underscore",
  "backbone"
], function (_, Backbone) {

  var TemplateModel = Backbone.Model.extend({
    initialize: function() {
    }
  });

  return TemplateModel;
});
