describe "registration" do
  before do
    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }
  end

  before(:each) do
    user = StoreUser.where(:email => @user_attributes[:email]).first
    if user
      user.destroy
    end
  end

  describe "with valid attributes" do
    before do
      post '/user.json', {:user => @user_attributes}.to_json
    end

    it 'should be successful' do
      last_response.status.should == 201
    end

    it 'should return the user information' do
      user = StoreUser.where(:email => @user_attributes[:email]).first
      last_response.body.should == user.to_json
    end

    it 'should log the user in' do
      get '/restricted'
      last_response.status.should == 201
    end
  end

  describe "with invalid attributes" do
    before do
      invalid_attributes = @user_attributes.merge(:email => nil)
      post '/user.json', {:user => invalid_attributes}.to_json
    end

    it 'should return status 400' do
      last_response.status.should == 400
    end

    it 'should contain errors in the body' do
      json_body = JSON.parse(last_response.body)
      json_body.should have_key("email")
    end
  end
end
