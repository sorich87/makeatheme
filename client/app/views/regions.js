var View = require("views/base/view")
  , template = require("views/templates/regions")
  , app = require("application");

module.exports = View.extend({
    id: "x-region-select"
  , className: "x-section"
  , collection: app.regions

  , render: function () {
    this.$el.empty().append(template({
        headers: this.collection.getByName("header").map(function (header) { return header.attributes; })
      , footers: this.collection.getByName("footer").map(function (footer) { return footer.attributes; })
    }));

    return this;
  }
});
