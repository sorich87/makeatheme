define([
       'jquery',
       'underscore',
       'backbone',
       'models/site',
       'collections/menu',
       'models/menu_item',
], function($, _, Backbone, Site, Menu, MenuItem) {

  var AppView, primary_menu
  , site = new Site;

  AppView = Backbone.View.extend({
    el: $('#theme iframe').contents()

    , editables: {
      site: {
        "x-site-title" : "title"
        , "x-site-description" : "description"
        , "x-site-credits" : "credits"
      }
      , page: {
        "x-page-title" : "title"
        , "x-page-content" : "content"
      }
    }

    , initialize: function() {
      this.resizeIframe();
      this.bindEdit();
      this.loadSite();
      this.bindSaveSite();
    }

    , resizeIframe: function() {
      var adjustIframeHeight = function () {
        $("#theme iframe").height(function () {
          return $(document).height();
        });
      };

      adjustIframeHeight();

      $(window).resize(function () {
        adjustIframeHeight();
      });
    }

    , bindEdit: function () {
      var _this = this;

      $(".customize").on("click", function () {
        _this.$("body").addClass("x-edit");
        _this.$(".x-edit .x-editable").attr("contenteditable", true);

        $(this).hide("slow");
        $(".save").show("slow");

        _this.showNotification("Click on the light yellow background areas to edit.", 'info');
      });

      $(".save").on("click", function () {
        _this.$("body").removeClass("x-edit");
        _this.$("[contenteditable]").attr("contenteditable", false);

        $(this).hide("slow");
        $(".customize").show("slow");

        _this.showNotification('Customization saved! You can <a href="#">buy the theme now</a> or come back later.', 'success');
      });

      require(['bootstrap/js/bootstrap-alert'], function () {
        $(".alert").alert();
      });
    }

    , loadSite: function () {
      var _this = this;

      _.each(this.editables.site, function(k, c) {
        _this.$("." + c).text(site.get(k));
      });
    }

    , bindSaveSite: function () {
      var _this = this
      , elements = _this.editables.site
      , classes = _.map(elements, function (k, c) {return "." + c}).toString();

      this.$(classes).on("blur keyup paste", function () {
        var text = $(this).text();

        $.each(this.classList, function (i, c) {
          if (c == "x-editable")
            return;

          var field = elements[c];
          site.set(field, text);
        });
      });
    }

    , showNotification: function (text, type) {
      $(".notification").remove();

      $(this.make("div", { class: "alert alert-" + type + " notification" },
                  '<button class="close" data-dismiss="alert">×</button>' + text))
                  .appendTo("body");
    }
  });

  return AppView;
});
