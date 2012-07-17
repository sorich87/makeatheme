define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/menu.html'
  ], function($, _, Backbone, menuTemplate){
  var TodoView = Backbone.View.extend({
    tagName:  "li",

    template: _.template(todosTemplate),

    events: {
    },

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.view = this;
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setContent();
      return this;
    },

    setContent: function() {
      var content = this.model.get('content');
      this.$('.todo-content').text(content);
      this.input = this.$('.todo-input');
      this.input.bind('blur', this.close, this);
      this.input.val(content);
    },

    close: function() {
      this.model.save({content: this.input.val()});
      $(this.el).removeClass("editing");
    },

    remove: function() {
      $(this.el).remove();
    },

  });

  return TodoView;
});
