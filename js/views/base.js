define([
  'jquery',
  'underscore',
  'backbone',
  ], function($, _, Backbone){
  var BaseView = Backbone.View.extend({
    initialize: function(options) {
      this.loadModel();
    }

    // Load model data in corresponding elements
    , loadModel: function () {
      if (this.editables === undefined)
        return;

      _.each(this.editables, function(f, c) {
        switch( f.type ) {
          case "text" :
            this.$(c).text(this.model.get(f.name));
          break;

          case "html" :
            this.$(c).html(this.model.get(f.name));
          break;
        }
      }, this);
    }
  });

  return BaseView;
});
