var View = require("views/base/view")
  , template = require("views/templates/style_edit")
  , app = require("application")
  , html_tags = require("lib/html_tags");

module.exports = View.extend({
    id: "x-style-edit"
  , className: "x-section"

  , events: {
      "change .x-tag": "setTag"
    , "click .add-rule": "addInputs"
    , "keyup .x-rules input": "addStyle"
    , "change .x-rules input": "addStyle"
    , "blur .x-rules input": "addStyle"
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
    var $button = $(e.currentTarget)
      , $ul = $button.siblings("ul")
      , selector = $button.siblings(".x-selector").find("input").val();

    e.preventDefault();

    $ul.append("<li><input name='property' value='' placeholder='property' />: " +
                        "<input name='value' value='' placeholder='value' />" +
                        "<input type='hidden' name='selector' value='" + selector + "' />" +
                        "<input type='hidden' name='index' /></li>");
  }

  , addStyle: function (e) {
    var selector, index
      , $li = $(e.target).parent();

    property = $li.find("input[name=property]").val();
    value = $li.find("input[name=value]").val();
    index = $li.find("input[name=index]").val() || null;

    if (property && value) {
      index = this.customCSS.insertRule({
          selector: $li.find("input[name=selector]").val()
        , property: property
        , value: value
        , index: index
        , media: this.media
      });
    } else if (index) {
      this.customCSS.deleteRule(index, this.media);
      index = "";
    }

    $li.find("input[name=index]").val(index);
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
});
