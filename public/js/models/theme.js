define([
  "underscore",
  "backbone",
], function (_, Backbone) {

  var ThemeModel = Backbone.Model.extend({
    idAttribute: "_id"
  });

  return ThemeModel;
});
