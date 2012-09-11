var View = require("views/base/view")
  , Themes = require("collections/themes")
  , template = require("views/templates/theme_list")
  , app = require("application");

module.exports = View.extend({
    el: $("<ul class='thumbnails'></ul>")

  , collection: new Themes(app.data.themes)

  , initialize: function () {
    this.bindEvents();
    // Use this so we can re-render the view
    // using another collection such as
    // the user's themes.
    this.allThemes = _.clone(this.collection);
  }

  , render: function (collection) {
    if (_.isEmpty(collection)) {
      this.collection.reset(this.allThemes.models);
    } else {
      this.collection.reset(collection);
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
