define([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "handlebars",
  "text!templates/theme_list.html"
], function ($, _, Backbone, init, Handlebars, themeListTemplate) {

  var ThemeListView = Backbone.View.extend({
      el: $("<ul class='thumbnails'></ul>")

    , initialize: function () {
      this.buildList();
      this.loadThemes();
    }

    , loadThemes: function () {
      this.collection.reset(init.themes);
    }

    , buildList: function () {
      this.collection.on("reset", this.addAll, this);
    }

    , addOne: function (theme) {
      var template = Handlebars.compile(themeListTemplate);

      this.$el.append(template(theme.toJSON()));
    }

    , addAll: function () {
      this.$el.html("");

      this.collection.each(function (theme) {
        this.addOne(theme);
      }, this);
    }
  });

  return ThemeListView;
});
