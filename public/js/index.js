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

  $(function () {
    new AppRouter();

    Backbone.history.start({pushState: true});

    require(["bootstrap/js/bootstrap-modal"], function () {
      // Hide modal previously shown before showing a new one
      $("#register, #login, #new-password, #confirm-password").on("show", function () {
        $("#register, #login, #new-password, #confirm-password").not("#" + this.id).modal("hide");
      })
    });
  });
});
