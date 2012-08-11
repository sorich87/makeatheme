define([
  "jquery",
  "underscore",
  "backbone",
  "views/index",
  "views/theme",
], function($, _, Backbone,
            IndexView, ThemeView) {

  var AppRouter = Backbone.Router.extend({
    routes: {
        "": "index"
      , "themes/:id": "theme"
    }

    , index: function () {
      (new IndexView).render();
    }

    , theme: function (id) {
      (new ThemeView).render();
    }
  });

  return AppRouter;
});

