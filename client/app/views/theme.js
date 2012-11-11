var View = require("views/base/view")
  , application = require("application")
  , cssProperties = require("lib/css_properties")
  , template = require("views/templates/theme");

module.exports = View.extend({
  initialize: function () {
    $("body").on("mouseenter", "[name=property]", function (e) {
      $(e.currentTarget).typeahead({
        source: cssProperties
      });
    });

    Backbone.history.on("route", this.fullWidth.bind(this));
    $(window).on("resize", this.fullWidth.bind(this));
  }

  , render: function () {
    this.$el.empty()
      .append(template({id: this.options.themeID}));
  }

  , fullWidth: function () {
    this.$("#canvas").width($(window).width() - 250)
      .height($(window).height() - 60);
  }
});
