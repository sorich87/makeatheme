var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , app = require("application")
  , CustomCSS = require("lib/custom_css")
  , html_tags = require("lib/html_tags");

module.exports = View.extend({
    id: "x-style-edit"
  , className: "x-section"

  , events: {
      "change .x-element": "setSelector"
    , "change .x-tag": "setTag"
    , "click button": "addInputs"
    , "keyup input[name=value]": "addStyle"
    , "blur input[name=value]": "addStyle"
    , "change input[name=value]": "addStyle"
  }

  , initialize: function () {
    _.bindAll(this, "setColumn", "buildDownload");

    app.on("editor:columnHighlight", this.setColumn);
    app.on("download:before", this.buildDownload);

    this.selector = "body";
    this.customCSS = new CustomCSS(app.data.style);
  }

  , setSelector: function (e) {
    var val = $(e.target).val();

    switch (val) {
      case "body":
      case "#page > header":
      case "#page > footer":
        this.selector = val;
      break;

      case "column":
        this.selector = this.column;
      break;
    }

    this.render();
  }

  , setTag: function (e) {
    this.tag = $(e.target).val();

    this.render();
  }

  , setColumn: function (element) {
    this.column = "#" + element.id;

    if (this.$("select").val() === "column") {
      this.selector = this.column;
      this.render();
    }
  }

  , render: function () {
    var rules;

    if (this.tag) {
      rules = this.customCSS.rules[this.selector + " " + this.tag];
    } else {
      rules = this.customCSS.rules[this.selector];
    }

    rules = _.map(rules, function (rule, property) {
      rule.property = property;
      return rule;
    });

    this.$el.html(template({
        elements: this.elementOptions()
      , htmlTags: this.tagOptions()
      , selector: this.selector
      , rules: rules
    }));

    if (["body", "#page > header", "#page > footer"].indexOf(this.$("select").val()) !== -1) {
      this.$(".x-choice").hide();
    }

    return this;
  }

  , elementOptions: function () {
    return [
      {
          label: "Whole Document"
        , value: "body"
        , selected: this.selector === "body" ? " selected" : ""
      }
      , {
          label: "Header"
        , value: "#page > header"
        , selected: this.selector === "#page > header" ? " selected" : ""
      }
      , {
          label: "Footer"
        , value: "#page > footer"
        , selected: this.selector === "#page > footer" ? " selected" : ""
      }
      , {
          label: "Selected Element"
        , value: "column"
        , selected: ["body", "#page > header", "#page > footer"].indexOf(this.selector) === -1 ? " selected" : ""
      }
    ];
  }

  , tagOptions: function () {
    var _this = this;

    return html_tags.map(function (group) {
      group.tags = group.tags.map(function (tag) {
        tag.selected = tag.tag === _this.tag ? " selected" : "";
        return tag;
      });
      return group;
    });
  }

  , addInputs: function (e) {
    e.preventDefault();

    this.$("ul").append("<li><input name='property' value='' placeholder='property' />: \
                        <input name='value' value='' placeholder='value' /></li>");
  }

  , addStyle: function (e) {
    var selector, property, value;

    selector = this.selector;
    if (this.tag) {
      selector += " " + this.tag;
    }

    value = e.target.value;

    property  = $(e.target).siblings("input[name=property]").val();

    this.customCSS.insertRule(selector, property, value);
  }

  , buildDownload: function (attributes) {
    attributes.style = this.customCSS.rules;
  }
});
