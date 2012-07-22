define(['underscore', 'backbone'], function (_, Backbone) {
  var MenuItemModel = Backbone.Model.extend({
    defaults: {
      name: 'Page',
      url: '#',
      id: 0,
      parent: 0
    },

    initialize: function() {
    }
  });

  return MenuItemModel;
});
