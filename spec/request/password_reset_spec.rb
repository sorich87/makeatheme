describe :password_reset do
  before(:each) do
    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    @user = StoreUser.find_or_create_by(@user_attributes)
    @user.generate_password_reset_token!
  end

  describe 'initiation' do
    before do
      put "/users/#{@user.email}/initiate_password_reset"
    end

    it "should be successful" do
      last_response.status.should == 204
    end

    it 'should generate a new reset token' do
      @user.password_reset_token.should_not == @user.reload.password_reset_token
    end
  end

  describe 'creation' do
    before do
      @user.reload
      put "/users/#{@user.password_reset_token}/reset_password"
    end

    it 'should be successful' do
      last_response.status.should == 200
    end

    it 'should return the user as JSON' do
      last_response.body.should == @user.to_json
    end

    it 'should log the user in' do
      get '/restricted'
      last_response.status.should == 201
    end
  end
end
