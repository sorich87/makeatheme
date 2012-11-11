var app = require("application")
  , View = require("views/base/view");

module.exports = View.extend({
  id: "editor-toggle"

  , events: {
    "click": "toggleEditor"
  }

  , render: function () {
    this.el.innerHTML = "&rarr;";

    return this;
  }

  , toggleEditor: function (e) {
    if (this.el.className === "collapsed") {
      $(e.currentTarget.parentNode).animate({"margin-right": "0"});
      $("#canvas", window.top.document).animate({
        width: this.canvasWidth
      });
      this.el.innerHTML = "&rarr;";
      this.el.className = "";
    } else {
      this.canvasWidth = $("#canvas", window.top.document).css("width");

      $(e.currentTarget.parentNode).animate({"margin-right": "-250px"});
      $("#canvas", window.top.document).animate({width: "100%"});

      this.el.innerHTML = "&larr;";
      this.el.className = "collapsed";
    }
  }
});
