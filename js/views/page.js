define([
  'jquery',
  'underscore',
  'backbone',
  'views/base'
  ], function($, _, Backbone, BaseView) {
  var PageView = BaseView.extend({
    el: $("html")

    , editables: {
        ".x-page-title" : {
          name: "title"
        , type: "text"
      }
      , ".x-page-content" : {
          name: "content"
        , type: "html"
      }
      , ".x-page-header-image" : {
          name: "header_image"
        , type: "image"
      }
    }

    , initialize: function(options) {
      this.constructor.__super__.initialize.apply(this, [options])
    }
  });

  return PageView;
});
