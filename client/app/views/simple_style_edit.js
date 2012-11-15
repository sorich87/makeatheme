var View = require("views/base/view")
  , app = require("application")
  , template = require("views/templates/simple_style_edit");

module.exports = View.extend({
  events: {
      "change input, select": "editStyle"
    , "keyup input[type=text]": "editStyle"
  }

  , initialize: function (options) {
    this.media = options.media;
    this.tag = options.tag;
    this.selector = options.selector;
    this.customCSS = options.customCSS;
    this.currentCSS = options.currentCSS || {};
  }

  , render: function () {
    switch (this.currentCSS.textAlign) {
      case "start" :
        this.currentCSS.textAlign = "left";
        break;

      case "end" :
        this.currentCSS.textAlign = "right";
        break;
    }

    this.el.innerHTML = template(this.currentCSS);

    return this;
  }

  , editStyle: function (e) {
    var field = e.currentTarget
      , selector = this.selector
      , property = field.name
      , value;

    if (this.tag) {
      selector += " " + this.tag;
    }

    switch (field.nodeName) {
      case "INPUT":
        value = field.value;
        break;

      case "SELECT":
        value = field.options[field.selectedIndex].value;
        break;
    }

    if ((property === "font-size" || property.match(/^(margin|padding)/)) &&
        !isNaN(parseFloat(value)) && isFinite(value)) {
      value = value + "px";
    }

    this.customCSS.insertRule({
      selector: selector
      , property: property
      , value: value
      , media: this.media
    }, true);
  }
});
