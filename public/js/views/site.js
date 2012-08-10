// Replace Handlebars tags by site details and blocks
define([
  'jquery',
  'underscore',
  'backbone',
  "handlebars",
], function($, _, Backbone, Handlebars) {

  var SiteView = Backbone.View.extend({
    el: $("body")

    , initialize: function () {
      this.render();
    }

    , render: function () {
      var replacements, requires, el, template;

      el = this.$el[0]

      // Build list of region templates to pass to requirejs
      requires = _.map(this.options.regions, function (region) {
        return "text!/editor/" + region.get("type") + ".html";
      });

      // Add list of blocks templates to pass to requirejs
      requires = _.union(requires, _.map(this.options.blocks, function (block) {
        return "text!templates/blocks/" + block.get("filename") + ".html";
      }));

      require(requires, $.proxy(function () {
        // Site details replacements
        replacements = {
            site_title: this.model.get("title")
          , site_description: this.model.get("description")
          , home_url: this.model.get("home_url")
          , site_url: this.model.get("site_url")
        };

        // Regions replacements
        _.each(this.options.regions, function (region) {
          var type = region.get("type")
            , html = require("text!/editor/" + type + ".html");

          replacements[type] = html;
        });

        // Blocks replacements
        _.each(this.options.blocks, function (block) {
          var id = block.get("id")
            , html = require("text!templates/blocks/" + block.get("filename") + ".html");

          replacements[id] = html;
        });

        // Perform a double replacement because regions contain tags
        template = Handlebars.compile(this.$el[0].outerHTML);
        template = template(replacements);
        template = Handlebars.compile(template);
        this.$el[0].outerHTML = template(replacements);
      }, this));

      return this;
    }
  });

  return SiteView;
});
