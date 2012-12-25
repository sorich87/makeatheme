var View = require("views/base/view")
  , app = require("application")
  , Template = require("models/template")
  , template = require("views/templates/templates");

module.exports = View.extend({
    id: "templates-select"
  , className: "x-section"
  , collection: app.currentTheme.get("templates")

  , events: {
      "change ul input": "switchTemplate"
    , "focus ul input": "switchTemplate"
    , "blur ul input": "switchTemplate"
    , "click .close": "removeTemplate"
  }

  , objectEvents: {
    collection: {
      "add": "addOne",
      "reset": "addAll",
      "remove": "removeOne"
    }
  }

  , appEvents: {
    "region:load": "saveRegion",
    "template:created": "render",
    "template:loaded": "render"
  }

  , render: function () {
    var standards = _.reject((new Template()).standards, function (standard) {
      return !!this.collection.getByName(standard.name);
    }.bind(this));

    this.$el.empty().append(template({
      standards: standards
    }));

    this.collection.reset(this.collection.models);

    return this;
  }

  , addOne: function (template) {
    var checked = ""
      , current = ""
      , remove = "";

    if (template.cid === this.collection.getCurrent().cid) {
      checked = " checked='checked'";
      current = " class='current'";
    }

    if (template.get("name") != "index") {
      remove = "<span class='close' title='Delete template'>&times;</span>";
    }

    this.$("ul").append("<li" + current + "><label><input name='x-template'" + checked +
                        " type='radio' value='" + template.cid + "' />" +
                        template.label() + "</label>" + remove + "</li>");
  }

  , addAll: function () {
    this.$("ul").empty();

    _.each(this.collection.models, function (template) {
      this.addOne(template);
    }, this);
  }

  , removeOne: function (template) {
    this.$("input[value='" + template.cid + "']").closest("li").remove();
  }

  , switchTemplate: function () {
    var template = this.collection.get(this.$("ul input:checked").val());

    this.$("ul li").removeClass("current");
    this.$("ul input:checked").closest("li").addClass("current");
  }

  // Remove column if confirmed.
  , removeTemplate: function (e) {
    if (confirm("Are you sure you want to delete this template?")) {
      var cid = $(e.currentTarget).parent().find("input").val();
      this.collection.remove(cid);
      this.render();
    }
  }

  , saveRegion: function (region) {
    this.collection.getCurrent().setRegion(region.get("name"), region.get("slug"));
  }
});
