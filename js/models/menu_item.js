define(['underscore', 'backbone'], function (_, Backbone) {
  var MenuItemModel = Backbone.Model.extend({
    defaults: {
      name: 'Page',
      url: '#'
    },

    initialize: function() {
    }
  });

  return MenuItemModel;
});
