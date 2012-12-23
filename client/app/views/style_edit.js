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
      "click .selector-choice a": "highlightElement"
    , "change .tag": "setTag"

    , "click .back-to-general": "hideEditor"
    , "change input[name=style_advanced]": "switchEditor"
  }

  , appEvents: {
    "column:highlight": "showEditor",
    "resize:end": "changeWidth"
  }

  , initialize: function () {
    this.selector = "body";
    this.customCSS = app.currentTheme.get("style");
    this.editorView = "simple_style_edit";

    View.prototype.initialize.call(this);
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
    var advanced = this.editorView === "advanced_style_edit" ? true : false,
        editorView;

    this.media = "all";

    this.el.innerHTML = template({
        htmlTags: this.tagOptions()
      , selector: this.selector
      , parents: $(this.selector).parents().get().reverse()
      , advanced: advanced
    });

    editorView = app.createView(this.editorView, {
        selector: this.selector
      , tag: this.tag
      , media: this.media
      , customCSS: this.customCSS
      , currentCSS: this.currentElementStyle(!advanced)
    });
    this.subViews.push(editorView);

    this.$el.append(editorView.render().$el);

    return this;
  }

  , tagOptions: function () {
    var _this = this;

    return html_tags.map(function (group) {
      group.tags = group.tags.map(function (tag) {
        tag.selectedAttr = tag.tag === _this.tag ? " selected" : "";
        return tag;
      });
      return group;
    });
  }

  , changeWidth: function (selector, width) {
    width = parseInt(width, 10) / $(selector).parent().width() * 100;
    width = (Math.round(width * 100) / 100) + "%";

    this.customCSS.insertRule({
        selector: selector
      , property: "width"
      , value: width
      , media: "all"
    }, true);

    this.render();
  }

  , highlightElement: function (e) {
    var selector = e.currentTarget.getAttribute("data-selector");

    e.preventDefault();

    $(".x-current").removeClass("x-current");
    $(selector).addClass("x-current");

    this.selector = selector;
    this.render();
  }

  , showEditor: function (element) {
    this.setColumn(element);
    this.$el.siblings("#general").hide();
    this.$el.show();
  }

  , hideEditor: function () {
    this.$el.hide();
    this.$el.siblings("#general").show();
  }

  , switchEditor: function (e) {
    if (e.currentTarget.checked) {
      this.editorView = "advanced_style_edit";
    } else {
      this.editorView = "simple_style_edit";
    }

    this.render();
  }

  , currentElementStyle: function (computed) {
    var style, declarations, $element, $fakeElement;

    if (this.tag) {
      $element = $("<" + this.tag + ">");
      $fakeElement = $("<div></div>");
      $fakeElement
        .hide()
        .append($element)
        .appendTo($(this.selector));
    } else {
      $element = $(this.selector);
    }

    if (computed) {
      style = _.clone(window.getComputedStyle($element.get(0)));
    } else {
      declarations = this.customCSS.getDeclarations($element.get(0));
      if (declarations) {
        style = declarations[this.media];
      }
    }

    if ($fakeElement) {
      $fakeElement.remove();
    }

    return style;
  }
});
