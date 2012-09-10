var View = require("views/base/view")
  , Themes = require("collections/themes")
  , template = require("views/templates/theme_list")
  , app = require("application");

module.exports = View.extend({
    el: $("<ul class='thumbnails'></ul>")

  , collection: new Themes(app.data.themes)

  , initialize: function () {
    this.bindEvents();
  }

  , render: function (filters) {
    if (_.isEmpty(filters)) {
      this.collection.reset(this.collection.models);
    } else {
      this.collection.reset(this.collection.where(filters));
    }

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
