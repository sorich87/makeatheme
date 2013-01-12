var View = require("views/base/view")
  , template = require("views/templates/themes")
  , Themes = require("collections/themes")
  , app = require("application");

module.exports = View.extend({
  collection: new Themes(app.data.themes),

  render: function () {
    var listView = app.createView("theme_list", {collection: this.collection});

    this.subViews.push(listView);

    this.$el.empty()
      .append(template())
      .append(listView.render().$el);

    return this;
  }
});

