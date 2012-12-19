var View = require("views/base/view")
  , app = require("application")
  , template = require("views/templates/simple_style_edit");

module.exports = View.extend({
  events: {
      "change input, select": "editStyle"
    , "keyup input[type=text]": "editStyle"
  }

  , render: function () {
    var currentCSS = this.options.currentCSS || {};

    switch (currentCSS.textAlign) {
      case "start" :
        currentCSS.textAlign = "left";
        break;

      case "end" :
        currentCSS.textAlign = "right";
        break;
    }

    this.el.innerHTML = template(currentCSS);

    return this;
  }

  , editStyle: function (e) {
    var field = e.currentTarget
      , selector = this.options.selector
      , property = field.name
      , value;

    if (this.options.tag) {
      selector += " " + this.options.tag;
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

    this.options.customCSS.insertRule({
      selector: selector
      , property: property
      , value: value
      , media: this.options.media
    }, true);
  }
});
