var app = require("application"),
    View = require("views/base/view"),
    menubar = require("views/templates/menubar");

module.exports = View.extend({
  tagName: "ul",
  className: "nav",
  model: app.currentTheme,

  appEvents: {
    "theme:renamed": "render"
  },

  render: function () {
    this.$el.empty().append(menubar({theme_name: this.model.get("name")}));

    this.buildFileMenu();
    this.buildViewMenu();

    return this;
  },

  buildFileMenu: function () {
    var menu = this.$("#file-menu"),
        copyThemeView = app.createView("copy_theme"),
        renameThemeView = app.createView("rename_theme"),
        saveThemeView = app.createView("save_theme"),
        shareThemeView = app.createView("share_theme"),
        downloadThemeView = app.createView("download_theme");

    this.subViews.push(copyThemeView, saveThemeView, shareThemeView,
                       downloadThemeView);

    if (app.currentUser.canEdit(app.currentTheme)) {
      menu.append(saveThemeView.render().$el);
      menu.append(renameThemeView.render().$el);
      menu.append(shareThemeView.render().$el);
      menu.append(this.divider());
      menu.append(downloadThemeView.render().$el);
      menu.append(this.divider());
    }

    menu.append(copyThemeView.render().$el);
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

