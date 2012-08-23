// Tests for RegisterView class.
var RegisterView = require("views/register");

beforeEach(function () {
  this.user = { save: function () {} };

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

    this.registerView = new RegisterView({
      model: this.user
    });

    expect(spy).to.have.been.calledOnce;
  });

  it ("will render the registration modal", function () {
    expect(this.registerView.render().el.innerHTML).to.contain("<h3>Create an account</h3>");
  });

  it("will save the user with correct attributes on clicking submit", function () {
    var spy = sinon.spy(this.user, "save");

    this.registerView.render().$("input")[0].value = "test";
    this.registerView.$(".submit").click();

    expect(spy).to.have.been.calledOnce;
    expect(spy.args[0][0].first_name).to.equal("test");
  });

  it("will hide the modal on success", function () {
    var spy = sinon.spy(this.registerView.$el, "modal");

    sinon.stub(this.user, "save", function (attrs, options) {
      options.success();
    });

    this.registerView.render().$(".submit").click();
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("hide");
  });

  it("will show error messages on error", function () {
    sinon.stub(this.user, "save", function (attrs, options) {
      options.error(this.user, {responseText: '{"first_name": ["is not valid"]}'});
    });

    this.registerView.render().$(".submit").click();
    expect(this.registerView.el.innerHTML).to.contain("is not valid");
  });
});
