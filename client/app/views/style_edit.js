var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , app = require("application")
  , CustomCSS = require("lib/custom_css");

module.exports = View.extend({
    id: "x-style-edit"
  , className: "x-section"

  , events: {
    "click button": "addInputs"
  }

  , initialize: function () {
    _.bindAll(this, "setColumn");

    app.on("editor:columnHighlight", this.setColumn);
  }

  , setColumn: function (column) {
    this.column = "#" + column.id;
    this.render();
  }

  , render: function () {
    var rules
      , customCSS = new CustomCSS;

    rules = _.map(customCSS.rules[this.column], function (rule, selector) {
      rule.selector = selector;
      return rule;
    });

    this.$el.html(template({
        element: this.column
      , rules: rules
    }));

    return this;
  }

  , addInputs: function (e) {
    e.preventDefault();

    this.$("ul").append("<li><input value='' placeholder='property' />: \
                        <input value='' placeholder='value' /></li>");
  }
});
