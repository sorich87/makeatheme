define([
  'jquery',
  'underscore',
  'backbone'
  ], function($, _, Backbone) {
  var SiteView = Backbone.View.extend({
    el: $(document)

    , editables: {
        ".x-site-title" : {
          name: "title"
        , type: "text"
      }
      , ".x-site-description" : {
          name: "description"
        , type: "text"
      }
    }

    , initialize: function(options) {
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

  return SiteView;
});
