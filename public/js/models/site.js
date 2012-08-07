define(['underscore', 'backbone'], function (_, Backbone) {
  var SiteModel = Backbone.Model.extend({
    defaults: {
        title: "Your Site Name"
      , description: "Just another WordPress site"
      , home_url: "#"
      , site_url: "#"
    },

    initialize: function() {
    }
  });

  return SiteModel;
});
