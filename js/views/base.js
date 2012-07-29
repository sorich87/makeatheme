define([
  'jquery',
  'underscore',
  'backbone',
  ], function($, _, Backbone){
  var BaseView = Backbone.View.extend({
    initialize: function(options) {
      this.loadModel();
      this.saveChanges();
    }

    // Load model data in corresponding elements
    , loadModel: function () {
      if (this.editables === undefined)
        return;

      _.each(this.editables, function(f, c) {
        switch( f.type ) {
          case "text" :
            this.$(c).text(this.model.get(f.name)).attr("contenteditable", true);
          break;

          case "html" :
            this.$(c).html(this.model.get(f.name));
          break;

          case "image" :
            this.$(c).prepend("<a class='x-edit' href=''>Change Image</a>");
          break;
        }
      }, this);
    }

    // Save changes to model when an element is modified
    , saveChanges: function () {
      if (this.editables === undefined)
        return;

      _.each(this.editables, function(f, c) {
        var _this = this;

        this.$(c).on("blur keyup paste", function () {
          switch (f.type) {
            case "text" :
              _this.model.set(f.name, $(this).text());
            break;

            case "html" :
              _this.model.set(f.name, $(this).html());
            break;
          }
        });
      }, this);
    }
  });

  return BaseView;
});
