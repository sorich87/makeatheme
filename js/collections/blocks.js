define([
  'underscore',
  'backbone',
  'models/block'
], function (_, Backbone, Block) {

	var BlocksCollection = Backbone.Collection.extend({
    model: Block
  });

  return BlocksCollection;
});
