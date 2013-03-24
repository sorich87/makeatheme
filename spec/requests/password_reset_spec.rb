describe :password_reset do
  before(:each) do
    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    @user = User.find_or_create_by(@user_attributes)
    @user.initiate_password_reset!(12345)
  end

  describe 'initiation' do
    before do
      post '/users/reset_password', @user_attributes.to_json
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
      get "/users/#{@user.id}/reset_password/#{@user.password_reset_token}"
    end

    it 'should redirect the user to the index page' do
      last_response.should be_redirect
      last_response.location.should include '/'
    end

    it 'should log the user in' do
      get '/restricted'
      last_response.status.should == 200
    end
  end
end
