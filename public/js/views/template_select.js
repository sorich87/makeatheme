define([
  "jquery",
  "underscore",
  "backbone"
], function ($, _, Backbone) {

  var TemplateSelectView = Backbone.View.extend({
      el: $("<div id='x-templates-select'><h4><label>Current Template</label></h4>\
            <form><select></select></form></div>")

    , initialize: function (options) {
      this.buildSelect();
      this.loadTemplates();
      this.switchTemplate();
    }

    , loadTemplates: function () {
      this.collection.reset(this.collection.models);
    }

    , buildSelect: function () {
      this.collection.on("add", this.addOne, this);
      this.collection.on("reset", this.addAll, this);
    }

    , addOne: function (template) {
      var selected = "";

      if (template.get("current")) {
        // Load selected attribute
        selected = " selected='selected'";

        // Save current template
        this.currentTemplate = template;
      }

      this.$("select").append("<option value='" + template.cid + "'" + selected + ">"
                      + template.get("name") + "</option>");
    }

    , addAll: function () {
      _.each(this.collection.models, function (t) {
        this.addOne(t);
      }, this);
    }

    , switchTemplate: function (e) {
      $(window.document).on("change", this.$el, $.proxy(function (e) {
        var template = this.collection.getByCid($(e.target).val());

        // Reset current template
        this.currentTemplate.set("current", false);
        template.set("current", true);

        // Load template file
        window.location.href = template.get("filename") + ".html";
      }, this));
    }
  });

  return TemplateSelectView;
});
