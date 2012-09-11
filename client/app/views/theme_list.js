var View = require("views/base/view")
  , Themes = require("collections/themes")
  , template = require("views/templates/theme_list")
  , app = require("application");

module.exports = View.extend({
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
    this.$el.append(template(theme.toJSON()));
  }

  , addAll: function () {
    this.$el.empty();

    this.collection.each(function (theme) {
      this.addOne(theme);
    }, this);
  }
});
