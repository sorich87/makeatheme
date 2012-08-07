define([
  "jquery",
  "underscore",
  "backbone"
], function ($, _, Backbone) {

  var TemplateSelectView = Backbone.View.extend({
      el: $("<select></select>")

    , initialize: function (options) {
      this.currentTemplate = options.currentTemplate;
      this.buildSelect();
      this.loadTemplates();
    }

    , loadTemplates: function () {
      this.collection.reset(this.collection.models);
    }

    , buildSelect: function () {
      this.collection.on("add", this.addOne, this);
      this.collection.on("reset", this.addAll, this);

      this.$el.on("change", $.proxy(this.switchTemplate, this));
    }

    , addOne: function (template) {
      var src
        , filename = template.get("filename")
        , name = template.get("name");

      selected = this.currentTemplate === filename ? " selected='selected'" : "";

      this.$el.append("<option value='" + filename + "'" + selected + ">"
                      + name + "</option>");
    }

    , addAll: function () {
      _.each(this.collection.models, function (t) {
        this.addOne(t);
      }, this);

      $("#x-templates-list").html(this.$el);
    }

    , switchTemplate: function () {
      window.location.href = this.$el.val();
    }
  });

  return TemplateSelectView;
});
