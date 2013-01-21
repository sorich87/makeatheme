describe :session do
  before(:each) do
    header "HTTP_ACCEPT", "application/json"
  end

  describe 'authentication' do
    it 'should not be OK with an empty request' do
      post '/session', '{}'
      last_response.status.should == 400
    end

    it 'should not be OK with an invalid password combination' do
      post '/session', current_user_attributes.merge(:password => "wrong_password").to_json
      last_response.status.should == 400
    end

    it 'should be OK with a valid password combination' do
      log_in!
      last_response.status.should == 201
    end
  end

  describe 'de-authenticating' do
    it "should be OK if we're authenticated" do
      log_in!
      log_out!
      last_response.status.should == 204
    end

    it "actually, it's fine all the time.. :)" do
      log_out!
      last_response.status.should == 204
    end
  end

  describe 'being authenticated' do
    it "should be OK to visit a restricted area" do
      log_in!
      get '/restricted'
      last_response.status.should == 201
    end
  end

  describe 'not being authenticated' do
    it "should not be able to visit restricted areas" do
      log_out!
      get '/restricted'
      last_response.status.should == 401
    end
  end
end
