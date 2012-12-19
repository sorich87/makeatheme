var View = require("views/base/view")
  , cssProperties = require("lib/css_properties")
  , template = require("views/templates/theme");

module.exports = View.extend({
  initialize: function () {
    $("body").on("mouseenter", "[name=property]", this.typeahead);
    $(window).on("resize", this.resize.bind(this));

    View.prototype.initialize.call(this);
  }

  , teardown: function () {
    $("body").off("mouseenter", "[name=property]", this.typeahead);
    $(window).off("resize", this.resize.bind(this));

    View.prototype.teardown.call(this);
  }

  , render: function () {
    this.$el.empty()
      .append(template({id: this.options.themeID}));

    this.resize();

    return this;
  }

  , typeahead: function (e) {
    $(e.currentTarget).typeahead({
      source: cssProperties
    });
  }

  , resize: function () {
    this.$("#canvas").width($(window).width() - 250)
      .height($(window).height() - 40);
  }
});
