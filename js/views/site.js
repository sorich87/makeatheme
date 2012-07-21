define([
  'jquery',
  'underscore',
  'backbone',
  'views/base'
  ], function($, _, Backbone, BaseView) {
  var SiteView = BaseView.extend({
    el: $('#theme iframe').contents()

    , editables: {
        ".x-site-title" : {
          name: "title"
        , type: "text"
      }
      , ".x-site-description" : {
          name: "description"
        , type: "text"
      }
      , ".x-site-credits" : {
          name: "credits"
        , type: "text"
      }
    }

    , initialize: function(options) {
      this.constructor.__super__.initialize.apply(this, [options])
    }
  });

  return SiteView;
});
