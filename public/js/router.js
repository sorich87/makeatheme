define([
  "jquery",
  "underscore",
  "backbone",
], function($, _, Backbone) {

  var AppRouter = Backbone.Router.extend({
    routes: {
        "": "index"
      , "themes/:id": "theme"
    }

    , index: function () {
      require(['views/index'], function(IndexView) {
        new IndexView;
      });
    }

    , theme: function (id) {
      require(['views/editor'], function(EditorView) {
        new EditorView;
      });
    }
  });

  return AppRouter;
});

