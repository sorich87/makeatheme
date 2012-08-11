define([
  "jquery",
  "underscore",
  "backbone",
  "handlebars",
  "text!templates/theme_list.html"
], function ($, _, Backbone, Handlebars, themeListTemplate) {

  var ThemeListView = Backbone.View.extend({
      el: $("<ul class='thumbnails'></ul>")

    , initialize: function () {
      this.bindEvents();
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , bindEvents: function () {
      this.collection.on("reset", this.addAll, this);
    }

    , addOne: function (theme) {
      var template = Handlebars.compile(themeListTemplate);

      this.$el.append(template(theme.toJSON()));
    }

    , addAll: function () {
      this.$el.empty();

      this.collection.each(function (theme) {
        this.addOne(theme);
      }, this);
    }
  });

  return ThemeListView;
});
