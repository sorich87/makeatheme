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
    }
  });

  return ThemeView;
});
