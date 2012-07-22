define([
  'underscore',
  'backbone',
  'models/menu_item'
], function (_, Backbone, MenuItem) {

	var MenuCollection = Backbone.Collection.extend({
    model: MenuItem
  });

  return new MenuCollection;
});
