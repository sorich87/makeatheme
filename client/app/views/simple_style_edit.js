var View = require("views/base/view")
  , app = require("application")
  , template = require("views/templates/simple_style_edit");

module.exports = View.extend({
  events: {
      "change input, select": "editStyle"
    , "keyup input[type=text]": "editStyle"
  }

  , initialize: function () {
    this.media = this.options.media;
    this.tag = this.options.tag;
    this.selector = this.options.selector;
    this.customCSS = this.options.customCSS;
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
