var View = require("views/base/view")
  , application = require("application")
  , cssProperties = require("lib/css_properties");

module.exports = View.extend({
    template: "theme"

  , id: "canvas"

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

    Backbone.history.on("route", this.fullWidth.bind(this));
    $(window).on("resize", this.fullWidth.bind(this));
  }

  , fullWidth: function () {
    this.$el.width($(window).width() - 250)
      .height($(window).height() - 60);
  }
});
