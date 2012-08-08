define([
  "jquery",
  "underscore",
  "backbone",
  "text!templates/faq.html",
  "collections/themes",
  "views/theme_list"
], function ($, _, Backbone, faqTemplate, ThemesCollection, ThemeListView) {

  var IndexView = Backbone.View.extend({
      el: $("#main")

    , initialize: function () {
      this.loadFaq();
      this.loadThemeList();
    }

    , loadFaq: function () {
      // Show FAQ collapsed by default
      require(["bootstrap/js/bootstrap-collapse"], $.proxy(function () {
        $("#faq").collapse();
        this.$el.on("click", "[href='#faq']", function (e) { e.preventDefault() });

        // Load template file
        $(faqTemplate).find("#faq").collapse("hide").end().prependTo(this.$el);
      }, this));
    }

    , loadThemeList: function () {
      new ThemeListView({collection: new ThemesCollection});
    }
  });

  return IndexView;
});
