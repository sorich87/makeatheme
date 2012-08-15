describe :session do
  before(:each) do
    header "HTTP_ACCEPT", "application/json"

    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    @user = StoreUser.find_or_create_by(@user_attributes)
  end

  describe 'authentication' do
    it 'should not be OK with an empty request' do
      post '/session.json'
      last_response.status.should == 400
    end

    it 'should not be OK with a valid password combination' do
      post '/session.json', {:session => @user_attributes.merge(:password => "wrong_password")}.to_json
      last_response.status.should == 400
    end

    it 'should be OK with a valid password combination' do
      post '/session.json', {:session => @user_attributes}.to_json
      last_response.status.should == 201
    end
  end

  describe 'de-authenticating' do
    it "should be OK if we're authenticated" do
      post '/session.json', {:session => @user_attributes}.to_json
      delete '/session.json'
      last_response.status.should == 204
    end

    it "actually, it's fine all the time.. :)" do
      delete '/session.json'
      last_response.status.should == 204
    end
  end

  describe 'being authenticated' do
    it "should be OK to visit a restricted area" do
      post '/session.json', {:session => @user_attributes}.to_json
      get '/restricted'
      last_response.status.should == 201
    end
  end

  describe 'not being authenticated' do
    it "should not be able to visit restricted areas" do
      delete '/session.json'
      get '/restricted'
      last_response.status.should == 403
    end
  end
end
