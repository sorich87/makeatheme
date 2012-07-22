define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/menu_item.html'
  ], function($, _, Backbone, menuItemTemplate) {
  var MenuItemView = Backbone.View.extend({
      tagName:  "li"

    , className: "menu-item"

    , template: _.template(menuItemTemplate)

    , initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.view = this;
    }

    , render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return MenuItemView;
});
