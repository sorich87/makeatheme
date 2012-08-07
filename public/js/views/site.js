define([
  'jquery',
  'underscore',
  'backbone',
  "handlebars",
  "text!templates/headerimage.html",
  "text!templates/menu.html",
  "text!templates/page.html",
  "text!templates/searchform.html",
  "text!templates/sidebar.html"
  ], function($, _, Backbone, Handlebars,
             headerimage, menu, page, searchform, sidebar) {

  var SiteView = Backbone.View.extend({
    el: $("body")

    , initialize: function() {
      var el = this.$el[0]
        , template = Handlebars.compile(el.outerHTML);

      el.outerHTML = template({
          site_title: this.model.get("title")
        , site_description: this.model.get("description")
        , home_url: this.model.get("home_url")
        , site_url: this.model.get("site_url")
        , header_image: headerimage
        , menu: menu
        , content: page
        , search_form: searchform
        , sidebar: sidebar
      });
    }
  });

  return SiteView;
});
