define([
  "jquery",
  "underscore",
  "backbone",
  "views/index",
  "views/theme",
  "views/editor"
], function($, _, Backbone,
            IndexView, ThemeView, EditorView) {

  var AppRouter = Backbone.Router.extend({
    routes: {
        "": "index"
      , "themes/:id": "theme"
      , "editor/*path" : "editor"
    }

    , index: function () {
      (new IndexView).render();
    }

    , theme: function (id) {
      (new ThemeView).render();
    }

    , editor: function () {
      (new EditorView).render();
    }
  });

  return AppRouter;
});

