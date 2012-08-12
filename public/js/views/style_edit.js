define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/style_edit.html"
], function ($, _, Backbone, style_edit) {

  var StyleEditView = Backbone.View.extend({
      el: $("<div id='x-style-edit'></div>")

    , render: function () {
      this.$el.html(style_edit);

      return this;
    }
  });

  return StyleEditView;
});
