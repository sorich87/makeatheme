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

    $(window).on("resize", this.resize.bind(this));
  }

  , render: function () {
    this.$el.empty()
      .append(template({id: this.options.themeID}));

    this.resize();

    return this;
  }

  , resize: function () {
    this.$("#canvas").width($(window).width() - 250)
      .height($(window).height() - 60);
  }
});
