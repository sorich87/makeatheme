var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , app = require("application")
  , CustomCSS = require("lib/custom_css");

module.exports = View.extend({
    id: "x-style-edit"
  , className: "x-section"
  , customCSS: new CustomCSS()

  , events: {
      "click button": "addInputs"
    , "keyup input[name=value]": "addStyle"
    , "blur input[name=value]": "addStyle"
    , "change input[name=value]": "addStyle"
  }

  , initialize: function () {
    _.bindAll(this, "setSelector");

    app.on("editor:columnHighlight", this.setSelector);
  }

  , setSelector: function (element) {
    this.selector = "#" + element.id;
    this.render();
  }

  , render: function () {
    var rules;

    if (!this.selector) {
      this.$el.html("Click on an element in the design to customize it.");
      return this;
    }

    rules = _.map(this.customCSS.rules[this.selector], function (rule, property) {
      rule.property = property;
      return rule;
    });

    this.$el.html(template({
        selector: this.selector
      , rules: rules
    }));

    return this;
  }

  , addInputs: function (e) {
    e.preventDefault();

    this.$("ul").append("<li><input name='property' value='' placeholder='property' />: \
                        <input name='value' value='' placeholder='value' /></li>");
  }

  , addStyle: function (e) {
    var property, value;

    value = e.target.value;

    property  = $(e.target).siblings("input[name=property]").val();

    this.customCSS.insertRule(this.selector, property, value);
  }
});
