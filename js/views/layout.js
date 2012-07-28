define([
  'jquery',
  'underscore',
  'backbone',
  'views/base'
  ], function ($, _, Backbone, BaseView) {

  var LayoutView = BaseView.extend({
      el: $("html")

    , initialize: function (options) {
      this.constructor.__super__.initialize.apply(this, [options])
    }

    , switchModes: function () {
      var _this = this
        , preventDefault = function (e) {
          e.preventDefault();
        };

      EventDispatcher.on("mode:edit", function () {
        require([
                "jquerypp/event/drag",
                "jquerypp/event/drag.limit",
                "jquerypp/event/drag.scroll",
                "jquerypp/event/drop"
        ], function () {
          // Links in draggable areas shouldn't be clickable
          _this.$(".columns a").on("click", preventDefault);

          _this.$el.on("draginit", ".columns", function (ev, drag) {
            drag.limit($("body").children());
            drag.scrolls($("iframe", parent.document));
          });

          // Cancel drag on content editable areas to allow edit
          _this.$el.on("dragdown", ".columns", function (ev, drag) {
            if ($(ev.target).attr("contenteditable") === true || $(ev.target).hasClass("x-edit")) {
              drag.cancel();
            }
          });

          _this.$el.on("dropon", ".row", function (ev, drop, drag) {
            var parentWidth, childrenWidth, dragParent;

            parentWidth = $(this).width();

            childrenWidth = _.reduce($(this).children(), function (memo, child) {
              if ($(child).is(drag.element)) {
                return memo;
              } else {
                return memo + parseFloat($(child).outerWidth());
              }
            }, 0, this);

            $dragParent = $(drag.element).parent();

            if ((parentWidth - childrenWidth) > (parentWidth * 8.333 / 100)) {
              row = this;
            } else {
              row = $("<div class='row'></div>").insertAfter(this);
            }

            $(drag.element).appendTo(row).css({top: 0, left: 0});

            if ($dragParent.children().length <= 0) {
              $dragParent.remove();
            }
          });
        });
      });

      EventDispatcher.on("mode:view", function () {
        require(["jquerypp/event/drag"], function () {
          _this.$el.off("draginit", ".columns");
          _this.$el.off("dragdown", ".columns");

          // Links are clickable again
          _this.$(".columns a").off("click", preventDefault);
        });
      });
    }
  });

  return LayoutView;
});
