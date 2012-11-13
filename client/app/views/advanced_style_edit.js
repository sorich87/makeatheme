var View = require("views/base/view")
  , declaration_template = require("views/templates/declaration")
  , rule_template = require("views/templates/rule")
  , app = require("application")
  , html_tags = require("lib/html_tags");

module.exports = View.extend({
  events: {
      "click .add-rule": "addRuleInputs"
    , "keyup .rules input": "editRule"
    , "change .rules input": "editRule"

    , "click .add-declaration": "addDeclarationInputs"
    , "keyup .selector input": "editDeclaration"
    , "change .selector input": "editDeclaration"
  }

  , initialize: function (options) {
    this.media = options.media;
    this.tag = options.tag;
    this.selector = options.selector;
    this.customCSS = options.customCSS;
    this.currentCSS = options.currentCSS;
  }

  , render: function () {
    var html = ""
      , declarations = this.currentCSS
      , i;

    if (declarations) {
      for (i = 0; i < declarations.length; i++) {
        html += declaration_template(declarations[i]);
      }
    }

    html += "<button class='btn add-declaration'>Add declaration</button>";

    this.$el.empty().append(html);

    this.markNonAppliedRules();

    return this;
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
    selector = selector.trim().replace(/^[^a-zA-Z#\.\[]|\W+$/g, "");

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
    var selector = this.selector;

    e.preventDefault();

    if (this.tag) {
      selector = this.selector + " " + this.tag;
    }

    $(e.currentTarget).before(declaration_template({selector: selector}));
  }

  , editDeclaration: function (e) {
    var $input = $(e.currentTarget)
      , value = $input.val();

    if (!value && e.type === "change") {
      $input.closest(".declaration-inputs").remove();
    }

    $input
      .parent()
        .siblings("ul")
          .find("input[name=selector]")
            .val(value)
            .trigger("change");
  }

  , markNonAppliedRules: function () {
    var applied = {};
    this.$(".rules input[name=property]").each(function () {
      var similar = applied[this.value];

      if (similar === void 0) {
        applied[this.value] = this;
        return;
      }

      if (this.parentNode.parentNode !== similar.parentNode.parentNode) {
        $(this.parentNode).addClass("inactive");
      }
    });
  }
});
