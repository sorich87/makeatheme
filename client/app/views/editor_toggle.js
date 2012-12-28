var app = require("application")
  , View = require("views/base/view");

module.exports = View.extend({
  className: "editor-toggle"

  , events: {
    "click": "toggleEditor"
  }

  , initialize: function () {
    var initIcon, collapseIcon;

    if (this.options.position === "left") {
      this.initIcon = "&rarr;";
      this.collapseIcon = "&larr;";
      this.margin = "margin-right";
    } else {
      this.initIcon = "&larr;";
      this.collapseIcon = "&rarr;";
      this.margin = "margin-left";
    }

    View.prototype.initialize.call(this);
  }

  , render: function () {
    this.el.className += " " + this.options.position;
    this.el.innerHTML = this.initIcon;

    return this;
  }

  , toggleEditor: function (e) {
    var style = {};

    if (this.$el.hasClass("collapsed")) {
      style[this.margin] = "0";
      $(e.currentTarget.parentNode.parentNode).animate(style);

      this.$el
        .empty().append(this.initIcon)
        .removeClass("collapsed");
    } else {
      style[this.margin] = "-220px";
      $(e.currentTarget.parentNode.parentNode).animate(style);

      this.$el
        .empty().append(this.collapseIcon)
        .addClass("collapsed");
    }
  }
});
