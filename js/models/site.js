define(['underscore', 'backbone'], function (_, Backbone) {
  var SiteModel = Backbone.Model.extend({
    defaults: {
      title: "Your Site Name",
      description: "Just another WordPress site",
      credits: "Copyright © 2012 Your Company Name"
    },

    initialize: function() {
    }
  });

  return SiteModel;
});
