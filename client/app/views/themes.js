var View = require("views/base/view")
  , template = require("views/templates/themes")
  , Themes = require("collections/themes")
  , app = require("application");

module.exports = View.extend({
  collection: new Themes(app.data.themes),

  initialize: function () {
    this.listView = app.createView("theme_list", {collection: this.collection});
  },

  render: function () {
    this.$el.empty()
      .append(template())
      .append(this.listView.render().$el);

    return this;
  }
});

