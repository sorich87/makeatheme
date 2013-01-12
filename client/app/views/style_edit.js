var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , declaration_template = require("views/templates/declaration")
  , rule_template = require("views/templates/rule")
  , app = require("application")
  , html_tags = require("lib/html_tags");

module.exports = View.extend({
    id: "style-edit"
  , className: "editor-sidebar"

  , events: {
      "click .selector-choice a": "highlightElement"
    , "change .tag": "setTag"
  }

  , appEvents: {
    "column:highlight": "setColumn",
    "resize:end": "changeWidth"
  }

  , initialize: function () {
    this.selector = "body";
    this.customCSS = app.currentTheme.get("style");

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
    var editorToggleView = app.createView("editor_toggle", {position: "left"}),
        editorView, tags;

    editorView = app.createView("simple_style_edit", {
        selector: this.selector
      , tag: this.tag
      , media: this.media
      , customCSS: this.customCSS
      , currentCSS: this.currentElementStyle()
    });

    this.subViews.push(editorView, editorToggleView);

    this.media = "all";

    tags = template({
        htmlTags: this.tagOptions()
      , selector: this.selector
      , parents: $(this.selector).parents().get().reverse()
    });

    this.$el.empty()
      .append("<div>")
      .children()
        .append(editorToggleView.render().$el)
        .append(tags)
        .append(editorView.render().$el);

    app.trigger("style:loaded");

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

  , currentElementStyle: function () {
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

    style = _.clone(window.getComputedStyle($element.get(0)));

    if ($fakeElement) {
      $fakeElement.remove();
    }

    return style;
  }
});
