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
      post '/session.json', :session => {}
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
end
