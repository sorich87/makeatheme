define([
  'underscore',
  'backbone',
  'models/template'
], function (_, Backbone, Template) {

	var TemplatesCollection = Backbone.Collection.extend({
    model: Template
  });

  return TemplatesCollection;
});

