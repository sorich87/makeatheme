define([
  'underscore',
  'backbone',
  'models/menu_item'
], function (_, Backbone, MenuItem) {

	var MenuCollection = Backbone.Collection.extend({
    model: MenuItem
  });

  // Initialize collection with default data
  return new MenuCollection([
    {id: 1, name: "Page", url: "#", parent: 0},
    {id: 2, name: "Second Page", url: "#", parent: 0},
    {id: 3, name: "Third Page", url: "#", parent: 1},
    {id: 4, name: "Fourth Page", url: "#", parent: 3}
  ]);
});
