// Tests for LoginView class.
var LoginView = require("views/login")
  , app = require("application");

beforeEach(function () {
  this.loginView = new LoginView({
    model: {
        set: function () {}
      , get: function () {}
    }
  });
});

afterEach(function () {
  this.loginView.remove();
});

describe ("LoginView", function () {
  it ("will render the login modal", function () {
    this.loginView.render();
    expect(this.loginView.el.className).to.equal("modal");
    expect(this.loginView.el.innerHTML).to.contain("Please authenticate yourself");
  });

  it("will display an error when the fields are not filled in", function () {
    sinon.stub(window.jQuery, "ajax");

    this.loginView.render().$("form").submit();

    expect(this.loginView.el.innerHTML).to.contain("can't be blank");

    window.jQuery.ajax.restore();
  });

  it("won't display an error when the fields are filled in", function () {
    sinon.stub(window.jQuery, "ajax");

    this.loginView.render().$("input").each(function (i, element) {
      element.value = "test";
    });
    this.loginView.$("form").submit();

    expect(this.loginView.el.innerHTML).to.not.contain("can't be blank");

    window.jQuery.ajax.restore();
  });

  it("will send a login request to the server", function () {
    var stub = sinon.stub(window.jQuery, "ajax");

    this.loginView.render().$("input").each(function (i, element) {
      element.value = "test";
    });
    this.loginView.$("form").submit();

    expect(stub).to.have.been.calledOnce;
    expect(stub.args[0][0]).to.have.property("contentType", "application/json;charset=UTF-8");
    expect(stub.args[0][0]).to.have.property("type", "POST");
    expect(stub.args[0][0]).to.have.property("dataType", "json");
    expect(stub.args[0][0]).to.have.property("url", "/session");

    window.jQuery.ajax.restore();
  });

  it("will display an error message on login error", function () {
    sinon.stub(window.jQuery, "ajax", function (options) {
      options.complete({responseText: "{\"error\": \"\"}"}, "error");
    });

    this.loginView.render().$("input").each(function (i, element) {
      element.value = "test";
    });
    this.loginView.$("form").submit();

    expect(this.loginView.el.innerHTML).to.contain("alert-error");

    window.jQuery.ajax.restore();
  });

  it("will update the user model on success", function () {
    var spy = sinon.spy(this.loginView.model, "set");

    sinon.stub(window.jQuery, "ajax", function (options) {
      options.complete({responseText: "{\"id\": \"1\"}"}, "success");
    });

    this.loginView.render().$("input").each(function (i, element) {
      element.value = "test";
    });
    this.loginView.$("form").submit();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith({id: "1"});

    window.jQuery.ajax.restore();
  });

  it("will hide the modal on success", function () {
    var spy = sinon.spy(this.loginView.$el, "modal");

    sinon.stub(window.jQuery, "ajax", function (options) {
      options.complete({responseText: "{\"id\": \"1\"}"}, "success");
    });

    this.loginView.render().$("input").each(function (i, element) {
      element.value = "test";
    });
    this.loginView.$("form").submit();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("hide");

    window.jQuery.ajax.restore();
  });

  it("will trigger a notification on success", function () {
    var spy = sinon.spy();

    app.on("notification", spy);

    sinon.stub(window.jQuery, "ajax", function (options) {
      options.complete({responseText: "{\"id\": \"1\"}"}, "success");
    });

    sinon.stub(this.loginView.model, "get", function () {
      return "Test";
    });

    this.loginView.render().$("input").each(function (i, element) {
      element.value = "test";
    });
    this.loginView.$("form").submit();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("success", "Welcome back, Test.");

    window.jQuery.ajax.restore();
  });
});
