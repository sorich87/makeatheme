define([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "text!templates/theme.html"
], function($, _, Backbone, init, theme) {

  var ThemeView = Backbone.View.extend({
      el: $("#main")

    , render: function () {
      this.$el.html(theme);

      $("body").addClass("theme");

      // Remove body class when navigating away from this view
      Backbone.history.on("route", function (e, name) {
        if (name !== "theme") {
          $("body").removeClass("theme");
        }
      });
    }
  });

  return ThemeView;
});
