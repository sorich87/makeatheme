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
    this.currentCSS = options.currentCSS;
  }

  , render: function () {
    this.el.innerHTML = template({font_family:""});

    return this;
  }

  , editStyle: function (e) {
    var field = e.currentTarget
      , property = field.name
      , value;

    switch (field.nodeName) {
      case "INPUT":
        value = field.value;
        break;

      case "SELECT":
        value = field.options[field.selectedIndex].value;
        break;
    }

    this.customCSS.insertRule({
      selector: this.selector
      , property: property
      , value: value
      , media: this.media
    }, true);
  }
});
