// Tests for User model class.
var User = require("models/user");

describe ("User", function () {
  it ("will be created with default values for its attributes", function () {
    var user = new User();

    expect(user.get("first_name")).to.equal("");
    expect(user.get("last_name")).to.equal("");
    expect(user.get("email")).to.equal("");
    expect(user.get("password")).to.equal("");
    expect(user.get("password_confirmation")).to.equal("");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var user = new User({
        first_name: "John"
      , last_name: "Doe"
      , email: "john.doe@makeatheme.com"
      , password: "12345"
      , password_confirmation: "12345"
    });

    expect(user.get("first_name")).to.equal("John");
    expect(user.get("last_name")).to.equal("Doe");
    expect(user.get("email")).to.equal("john.doe@makeatheme.com");
    expect(user.get("password")).to.equal("12345");
    expect(user.get("password_confirmation")).to.equal("12345");
  });

  it ("will have validation rules for its attributes.", function () {
    var user = new User();

    expect(user.validation).to.have.deep.property("first_name.required", true);
    expect(user.validation).to.have.deep.property("last_name.required", true);
    expect(user.validation).to.have.deep.property("email.required", true);
    expect(user.validation).to.have.deep.property("email.pattern", "email");
    expect(user.validation.password.required).to.be.a("function");
    expect(user.validation).to.have.deep.property("password_confirmation.equalTo", "password");
  });

  it("will require password for new users", function () {
    var user = new User();

    expect(user.validation.password.required.call(user, "", "password", {id: ""})).to.be.true;
    expect(user.validation.password.required.call(user, "", "password", {id: "1"})).to.be.false;
  });

  it ("will save users on the server", function () {
    var user, attrs, stub, stubArgs;

    stub = sinon.stub(window.jQuery, "ajax");

    user = new User();

    attrs = {
        first_name: "John"
      , last_name: "Doe"
      , email: "john.doe@makeatheme.com"
      , password: "12345"
      , password_confirmation: "12345"
      , themes: []
    };
    user.save(attrs);

    stubArgs = stub.args[0];

    expect(stub).to.have.been.calledOnce;
    expect(stubArgs[0].url).to.equal("/users");
    expect(stubArgs[0].data).to.equal(JSON.stringify(attrs));

    window.jQuery.ajax.restore();
  });
});
