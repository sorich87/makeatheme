var app = require("application")
  , View = require("views/base/view");

module.exports = View.extend({
  el: $("<div id='x-layout-editor'>\
      <div class='x-handle'>&Dagger;</div>\
      </div>")

  , initialize: function () {
    $(window.document).on({
      draginit: function (e, drag) {
        var mouse = drag.mouseElementPosition;

        drag.representative($(drag.element).parent(), mouse.left(), mouse.top()).only();
      }

      , dragmove: function (e, drag) {
        $(drag.element).parent().css("zIndex", 9999);
      }
    }, "#x-layout-editor .x-handle");
  }

  // Load views
  , render: function() {
    this.$el

      // Append template select view
      .append(app.templateSelectView.render().$el)

      // Append block insertion view
      .append(app.blockInsertView.render().$el)

      // Append CSS editor view
      .append(app.styleEditView.render().$el)

      // Append download button view
      .append(app.downloadButtonView.render().$el)

      // Append result to body element
      .appendTo(app.siteView.render().$el);
  }
});
