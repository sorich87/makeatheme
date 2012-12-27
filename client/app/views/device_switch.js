var app = require("application")
  , View = require("views/base/view")
  , device_switch = require("views/templates/device_switch");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown-submenu",
  id: "device-switch"

  , events: {
      "click .pc-size": "resizeToPC"
    , "click .tablet-size": "resizeToTablet"
    , "click .phone-size": "resizeToPhone"
    , "click .dropdown-menu a": "highlightActive"
  }

  , render: function () {
    this.el.innerHTML = device_switch();

    return this;
  }

  , highlightActive: function (e) {
    this.$(".active").removeClass("active");
    $(e.currentTarget.parentNode).addClass("active");
  }

  , resizeToPC: function (e) {
    e.preventDefault();

    $("#theme", window.top.document).animate({
        width: "auto"
      , "min-width": "1600px"
      , left: "50%"
      , "margin-left": "-50%"
    });
  }

  , resizeToTablet: function (e) {
    e.preventDefault();

    $("#theme", window.top.document).animate({
        width: "768px"
      , "min-width": "768px"
      , left: "50%"
      , "margin-left": "-384px"
    });
  }

  , resizeToPhone: function (e) {
    e.preventDefault();

    $("#theme", window.top.document).animate({
        width: "480px"
      , "min-width": "480px"
      , left: "50%"
      , "margin-left": "-240px"
    });
  }
});

