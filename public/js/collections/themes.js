define([
  "underscore",
  "backbone",
  "models/theme"
], function (_, Backbone, Theme) {

  var ThemesCollection = Backbone.Collection.extend({
    model: Theme
  });

  return ThemesCollection;
});
