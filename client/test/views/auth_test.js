// Tests for AuthView class.
var AuthView = require("views/auth");

beforeEach(function () {
  var user = {
      on: function () {}
    , toJSON: function () { return {id: "1"} }
  };

  this.authView = new AuthView({
    model: user
  });
});

afterEach(function () {
  this.authView.remove();
});

describe("AuthView", function () {
  it("will re-render when the user model change", function () {
    var spy = sinon.spy(this.authView.model, "on");

    this.authView.initialize();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("change", this.authView.render, this.authView);
  });

  it("will show the login and register links when user is not logged in", function () {
    sinon.stub(this.authView.model, "toJSON", function () { return {}; });

    this.authView.render();

    expect(this.authView.el.innerHTML).to.contain('id="register"');
    expect(this.authView.el.innerHTML).to.contain('id="login"');
  });

  it("will show the logout button when user is logged in", function () {
    this.authView.render();

    expect(this.authView.el.innerHTML).to.contain('id="logout"');
  });

  it("will delete the user session on logout", function () {
    var stub = sinon.stub(window.jQuery, "ajax");

    this.authView.render().$("#logout").click();

    expect(stub).to.have.been.calledOnce;
    expect(stub.args[0][0]).to.have.property("contentType", "application/json; charset=UTF-8");
    expect(stub.args[0][0]).to.have.property("type", "DELETE");
    expect(stub.args[0][0]).to.have.property("url", "/session.json");

    window.jQuery.ajax.restore();
  });

  it("will redirect the user to the homepage on logout", function () {
    sinon.stub(window.jQuery, "ajax", function (options) {
      options.complete(null, "success");
    });

    sinon.stub(this.authView.model, "toJSON", function () { return {id: "1"}; });

    this.authView.render().$("#logout").click();

    expect(window.location).to.equal("/");

    window.jQuery.ajax.restore();
  });
});
