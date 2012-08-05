define(['underscore', 'backbone'], function (_, Backbone) {
  var SiteModel = Backbone.Model.extend({
    defaults: {
      title: "Your Site Name",
      description: "Just another WordPress site"
    },

    initialize: function() {
    }
  });

  return SiteModel;
});
