var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , app = require("application")
  , html_tags = require("lib/html_tags");

module.exports = View.extend({
    id: "x-style-edit"
  , className: "x-section"

  , events: {
      "change .x-tag": "setTag"
    , "click button": "addInputs"
    , "keyup input": "addStyle"
    , "blur input": "addStyle"
    , "change input": "addStyle"
  }

  , initialize: function () {
    app.on("column:highlight", this.setColumn.bind(this));
    app.on("save:before", this.addThemeAttributes.bind(this));
    app.on("resize:end", this.changeWidth.bind(this));

    this.selector = "body";
    this.customCSS = app.editor.style;
  }

  , setTag: function (e) {
    this.tag = $(e.target).val();

    this.render();
  }

  , setColumn: function (element) {
    this.selector = "#" + element.id;
    this.render();
  }

  , render: function () {
    var rules;
    console.log(this.customCSS.getDeclarations(this.selector));

    if (this.tag) {
      rules = this.customCSS.values.all[this.selector + " " + this.tag];
    } else {
      rules = this.customCSS.values.all[this.selector];
    }

    rules = _.map(rules, function (rule, property) {
      rule.property = property;
      return rule;
    });

    this.$el.html(template({
        htmlTags: this.tagOptions()
      , selector: this.selector
      , rules: rules
    }));

    if (["body", "#page > header", "#page > footer"].indexOf(this.$("select").val()) !== -1) {
      this.$(".x-choice").hide();
    }

    return this;
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

    this.$("ul").append("<li><input name='property' value='' placeholder='property' />:" +
                        "<input name='value' value='' placeholder='value' />" +
                        "<input type='hidden' name='index' /></li>");
  }

  , addStyle: function (e) {
    var selector, property, value, index
      , $li = $(e.target).parent();

    selector = this.selector;
    if (this.tag) {
      selector += " " + this.tag;
    }

    property  = $li.find("input[name=property]").val();
    value  = $li.find("input[name=value]").val();
    index  = $li.find("input[name=index]").val() || null;

    index = this.customCSS.insertRule(selector, property, value, index);

    $li.find("input[name=index]").val(index);
  }

  , addThemeAttributes: function (attributes) {
    attributes.style = this.customCSS.rules;
  }

  , changeWidth: function (selector, width) {
    width =  parseInt(width, 10) / $(selector).parent().width() * 100;
    this.customCSS.insertRule(selector, "width", width + "%");

    this.render();
  }
});
