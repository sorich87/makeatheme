define([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "text!templates/faq.html",
  "views/theme_list",
  "bootstrap/js/bootstrap-collapse"
], function ($, _, Backbone, init, faqTemplate, ThemeListView) {

  var IndexView = Backbone.View.extend({
      el: $("#main")

    , initialize: function () {
      this.bindEvents();
    }

    , render: function () {
      this.loadViews();
    }

    , bindEvents: function () {
      // Show FAQ collapsed by default
        $("#faq").collapse();
        $(window.document).on("click", "[href='#faq']", function (e) { e.preventDefault() });
    }

    , loadViews: function () {
      this.$el
        .empty()
        .append(faqTemplate)
        .append(new ThemeListView({
        collection: init.themes
      }).render().$el);
    }
  });

  return IndexView;
});
