var app = require("application"),
    View = require("views/base/view"),
    menubar = require("views/templates/menubar");

module.exports = View.extend({
  tagName: "ul",
  className: "nav",
  model: app.currentTheme,

  render: function () {
    this.$el.empty().append(menubar({theme_name: this.model.get("name")}));

    this.buildFileMenu();
    this.buildViewMenu();

    return this;
  },

  buildFileMenu: function () {
    var menu = this.$("#file-menu"),
        copyView = app.createView("copy"),
        saveView = app.createView("save"),
        downloadView = app.createView("download");

    this.subViews.push(copyView);

    if (app.currentUser.canEdit(app.currentTheme)) {
      menu.append(saveView.render().$el);
      menu.append(this.divider());
      menu.append(downloadView.render().$el);
      menu.append(this.divider());
    }

    menu.append(copyView.render().$el);
  },

  buildViewMenu: function () {
    var menu = this.$("#view-menu"),
        deviceSwitchView = app.createView("device_switch"),
        templatesSelectView = app.createView("templates_select");

    this.subViews.push(deviceSwitchView, templatesSelectView);

    menu.append(deviceSwitchView.render().$el);

    if (!app.currentUser.canEdit(app.currentTheme)) {
      menu.append(templatesSelectView.render().$el);
    }
  },

  divider: function () {
    return "<li class='divider'></li>";
  }
});

