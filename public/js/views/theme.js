define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/theme.html"
], function($, _, Backbone, theme) {

  var ThemeView = Backbone.View.extend({
      el: $("#main")

    , render: function () {
      this.$el.html(theme);

      $("body").addClass("theme");
    }
  });

  return ThemeView;
});
