// Tests for RegisterView class.
var RegisterView = require("views/register")
  , app = require("application");

beforeEach(function () {
  this.user = {
      set: function () {}
    , save: function () {}
  };

  this.registerView = new RegisterView({
    model: this.user
  });
});

afterEach(function () {
  this.registerView.remove();
});

describe("RegisterView", function () {
  it ("will have validation", function () {
    var spy = sinon.spy(window.Backbone.Validation, "bind");

    this.registerView.initialize();

    expect(spy).to.have.been.calledOnce;
  });

  it ("will render the registration modal", function () {
    expect(this.registerView.render().el.className).to.equal("modal");
    expect(this.registerView.render().el.innerHTML).to.contain("<h3>Create an account</h3>");
  });

  it("will save the user with correct attributes on clicking submit", function () {
    var spy = sinon.spy(this.user, "save");

    this.registerView.render().$("input")[0].value = "test";
    this.registerView.$("form").submit();

    expect(spy).to.have.been.calledOnce;
    expect(spy.args[0][0].first_name).to.equal("test");
  });

  it("will update the model attributes on success", function () {
    var spy = sinon.spy(this.user, "set")
      , user = this.user;

    sinon.stub(user, "save", function (attrs, options) {
      options.success(user, {id: "1"});
    });

    this.registerView.render().$("form").submit();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith({id: "1"});
  });

  it("will hide the modal on success", function () {
    var spy = sinon.spy(this.registerView.$el, "modal")
      , user = this.user;

    sinon.stub(user, "save", function (attrs, options) {
      options.success(user);
    });

    this.registerView.render().$("form").submit();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("hide");
  });

  it("will show error messages on error", function () {
    sinon.stub(this.user, "save", function (attrs, options) {
      options.error(this.user, {responseText: '{"first_name": ["is not valid"]}'});
    });

    this.registerView.render().$("form").submit();
    expect(this.registerView.el.innerHTML).to.contain("is not valid");
  });

  it("will trigger a notification on success", function () {
    var spy = sinon.spy()
      , user = this.user;

    app.on("notification", spy);

    sinon.stub(user, "save", function (attrs, options) {
      options.success(user);
    });

    this.registerView.render().$("form").submit();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("success", "Your registration was successful. You are now logged in.");
  });
});
