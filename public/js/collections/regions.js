define([
  'underscore',
  'backbone',
  'models/region'
], function (_, Backbone, Region) {

	var RegionsCollection = Backbone.Collection.extend({
    model: Region
  });

  return RegionsCollection;
});
