var View = require("views/base/view")
  , template = require("views/templates/theme")
  , application = require("application");

module.exports = View.extend({
  render: function () {
    this.$el.empty()
      .append(template({id: this.options.themeID}));

    return this;
  }
});
