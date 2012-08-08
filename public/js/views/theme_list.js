define([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "text!templates/themes_list.html"
], function ($, _, Backbone, init, themeList) {

  var ThemeListView = Backbone.View.extend({
      el: $("<ul class='thumbnails'></ul>").appendTo("#main")

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
      var template = _.template(themeList);
      this.$el.append(template(theme.toJSON()));
    }

    , addAll: function () {
      this.collection.each(function (theme) {
        this.addOne(theme);
      }, this);
    }
  });

  return ThemeListView;
});
