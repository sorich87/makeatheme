define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/menu_item.html'
  ], function($, _, Backbone, menuItemTemplate){
  var TodoView = Backbone.View.extend({
    tagName:  "li",

    template: _.template(menuItemTemplate),
  });

  return TodoView;
});
