var View = require("views/base/view")
  , application = require("application");

module.exports = View.extend({
    template: "theme"
  , data: function () {
    return {
        route: this.options.route
      , id: this.options.themeID
      , action: this.options.action || ""
    };
  }
});
