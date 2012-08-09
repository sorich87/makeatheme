define([
  'jquery',
  'underscore',
  'backbone',
  "handlebars",
  "text!templates/blocks/headerimage.html",
  "text!templates/blocks/menu.html",
  "text!templates/blocks/page.html",
  "text!templates/blocks/searchform.html",
  "text!templates/blocks/sidebar.html"
  ], function($, _, Backbone, Handlebars,
             headerimage, menu, page, searchform, sidebar) {

  var SiteView = Backbone.View.extend({
    el: $("body")

    , initialize: function() {
      this.render();
    }

    , render: function () {
      var replacements, blocks
        , el = this.$el[0]
        , template = Handlebars.compile(el.outerHTML);

      replacements = {
          site_title: this.model.get("title")
        , site_description: this.model.get("description")
        , home_url: this.model.get("home_url")
        , site_url: this.model.get("site_url")
      };

      _.each(this.collection.models, function (block) {
        var id = block.get("id")
          , html = require("text!templates/blocks/" + block.get("filename"));

        replacements[id] = html;
      }, this);

      el.outerHTML = template(replacements);

      return this;
    }
  });

  return SiteView;
});
