var View = require("views/base/view")
  , application = require("application")
  , cssProperties = require("lib/css_properties");

module.exports = View.extend({
    template: "theme"
  , data: function () {
    return {
        route: this.options.route
      , id: this.options.themeID
      , action: this.options.action || ""
    };
  }

  , initialize: function () {
    $("body").on("mouseenter", "[name=property]", function (e) {
      $(e.currentTarget).typeahead({
        source: cssProperties
      });
    });
  }
});
