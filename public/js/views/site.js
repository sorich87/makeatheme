// Replace Handlebars tags by site details and blocks
define([
  'jquery',
  'underscore',
  'backbone',
  "handlebars",
], function($, _, Backbone, Handlebars) {

  var SiteView = Backbone.View.extend({
    el: $("body")

    , initialize: function() {
      this.render();
    }

    , render: function () {
      var replacements, requires, el, template;

      el = this.$el[0]
      template = Handlebars.compile(el.outerHTML);

      // Build list of blocks templates to pass to requirejs
      requires = _.map(this.collection.models, function (block) {
        return "text!templates/blocks/" + block.get("filename");
      });

      require(requires, $.proxy(function () {
        // Site details replacements
        replacements = {
            site_title: this.model.get("title")
          , site_description: this.model.get("description")
          , home_url: this.model.get("home_url")
          , site_url: this.model.get("site_url")
        };

        // Blocks replacements
        _.each(this.collection.models, function (block) {
          var id = block.get("id")
            , html = require("text!templates/blocks/" + block.get("filename"));

          replacements[id] = html;
        });

        // Perform the replacement
        el.outerHTML = template(replacements);
      }, this));

      return this;
    }
  });

  return SiteView;
});
