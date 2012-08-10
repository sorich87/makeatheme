define([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "text!templates/theme.html"
], function($, _, Backbone, init, theme) {

  var ThemeView = Backbone.View.extend({
      el: $("#main")

    , initialize: function () {
      window.addEventListener("message", this.initEditor, false);
    }

    , render: function () {
      this.$el.html(theme);

      $("body").addClass("theme");
    }

    // Send init settings to editor
    , initEditor: function (e) {
      if (e.origin !== window.location.origin)
        return;

      e.source.postMessage(init, e.origin);
    }
  });

  return ThemeView;
});
