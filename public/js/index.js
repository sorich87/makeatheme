require([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "lib/data_method"
], function($, _, Backbone, init) {

  var AppRouter, app_router;

  AppRouter = Backbone.Router.extend({
    routes: {
        "": "index"
      , "themes/:id": "theme"
    }

    , index: function () {
      require([
        "collections/themes",
        "views/theme_list"
      ], function (ThemesCollection, ThemeListView) {
        new ThemeListView({collection: new ThemesCollection});
      });
    }

    , theme: function (id) {
      require(['views/app'], function(AppView) {
        var app_view = new AppView;
      });
    }
  });

  $(function () {
    new AppRouter();

    Backbone.history.start({pushState: true});

    require(["bootstrap/js/bootstrap-collapse"], function () {
      // Show FAQ on index, collapsed by default
      $(".collapse").collapse();
      $("[href='#faq']").on("click", function (e) { e.preventDefault() });
    });

    require(["bootstrap/js/bootstrap-modal"], function () {
      // Hide modal previously shown before showing a new one
      $("#register, #login, #new-password, #confirm-password").on("show", function () {
        $("#register, #login, #new-password, #confirm-password").not("#" + this.id).modal("hide");
      })
    });
  });
});
