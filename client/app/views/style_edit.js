var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , declaration_template = require("views/templates/declaration")
  , rule_template = require("views/templates/rule")
  , app = require("application")
  , html_tags = require("lib/html_tags");

module.exports = View.extend({
    id: "style-edit"
  , className: "x-section"

  , events: {
      "change .tag": "setTag"

    , "click .add-rule": "addRuleInputs"
    , "keyup .rules input": "editRule"
    , "change .rules input": "editRule"

    , "click .add-declaration": "addDeclarationInputs"
    , "keyup .selector input": "editDeclaration"
    , "change .selector input": "editDeclaration"
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
    var selector, declarations;

    this.media = "all";

    selector = this.tag ? this.selector + " " + this.tag : this.selector;
    declarations = this.customCSS.getDeclarations(selector);

    this.$el.html(template({
        htmlTags: this.tagOptions()
      , selector: this.selector
      , parents: $(this.selector).parents().get().reverse()
      , declarations: declarations[this.media]
    }));

    this.markNonAppliedRules();

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

  , addRuleInputs: function (e) {
    var $button = $(e.currentTarget)
      , $ul = $button.siblings("ul");

    e.preventDefault();

    $ul.append(rule_template({
      selector: $button.siblings(".selector").find("input").val()
    }));
  }

  , editRule: function (e, element) {
    var selector, index
      , $li = $(e.target).parent();

    property = $li.find("input[name=property]").val();
    value = $li.find("input[name=value]").val();
    index = $li.find("input[name=index]").val() || null;
    selector = $li.find("input[name=selector]").val();

    // Trim whitespace and comma from selector to avoid DOM exception 12
    selector = selector.trim().replace(/^\W+|\W+$/g, "");

    if (property && value) {
      index = this.customCSS.insertRule({
          selector: selector
        , property: property
        , value: value
        , index: index
        , media: this.media
      });
    } else {
      if (index) {
        this.customCSS.deleteRule(index, this.media);
        index = "";
      }

      if (!property && !value && e.type === "change") {
        $li.remove();
      }
    }

    $li.find("input[name=index]").val(index);
  }

  , addDeclarationInputs: function (e) {
    e.preventDefault();

    $(e.currentTarget).before(declaration_template({selector: this.selector}));
  }

  , editDeclaration: function (e) {
    var $input = $(e.currentTarget)
      , value = $input.val();

    if (!value && e.type === "change") {
      $input.closest("div").remove();
    }

    $input
      .parent()
        .siblings("ul")
          .find("input[name=selector]")
            .val(value)
            .trigger("change");
  }

  , addThemeAttributes: function (attributes) {
    attributes.style = this.customCSS.getRules();
  }

  , changeWidth: function (selector, width) {
    this.customCSS.insertRule({
        selector: selector
      , property: "width"
      , value: (parseInt(width, 10) / $(selector).parent().width() * 100) + "%"
      , media: "all"
    });

    this.render();
  }

  , markNonAppliedRules: function () {
    var applied = [];
    this.$(".rules input[name=property]").each(function () {
      if (applied.indexOf(this.value) !== -1) {
        $(this).parent().addClass("inactive");
      } else {
        applied[applied.length] = this.value;
      }
    });
  }
});
