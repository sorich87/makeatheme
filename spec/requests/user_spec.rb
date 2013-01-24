describe :user do
  before do
    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }
  end

  after(:each) do
    User.destroy_all(email: @user_attributes[:email])
  end

  describe :listing do
    before(:each) do
      @user = User.create!(@user_attributes)
      get '/users'
    end

    it 'should be successful' do
      last_response.status.should == 200
    end

    it 'should return the user details' do
      last_response.body.should == {
        results: [@user],
        pagination: {per_page: 25, total_results: 1}
      }.to_json
    end
  end

  describe :registration do
    describe "with valid attributes" do
      before(:each) do
        post '/users', @user_attributes.to_json
      end

      it 'should be successful' do
        last_response.status.should == 201
      end

      it 'should return the user information' do
        user = User.where(:email => @user_attributes[:email]).first
        last_response.body.should == user.to_json
      end

      it 'should log the user in' do
        get '/restricted'
        last_response.status.should == 201
      end
    end

    it 'should send a confirmation email' do
      Pony.should_receive(:mail) do |params|
        params[:to] == @user_attributes[:email]
        params[:subject].should include('Start Making your Themes')
        params[:body].should include(@user_attributes[:first_name])
        params[:body].should include('http://www.makeatheme.com/')
      end

      post '/users', @user_attributes.to_json
    end

    describe "with invalid attributes" do
      before(:each) do
        invalid_attributes = @user_attributes.merge(:email => nil)
        post '/users', invalid_attributes.to_json
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

  describe :edit do
    before(:each) do
      @user = User.create(@user_attributes)
    end

    it 'should fail if current password not sent' do
      put "/users/#{@user.id}", @user_attributes.to_json
      last_response.status.should == 400
      JSON.parse(last_response.body).should have_key('current_password')
    end

    it 'should be successful with valid attributes' do
      attributes = @user_attributes
      attributes.merge!(current_password: @user_attributes[:password])

      put "/users/#{@user.id}", attributes.to_json
      last_response.status.should == 202
    end

    it 'should fail with invalid attributes' do
      attributes = @user_attributes
      attributes.merge!(
        email: '',
        current_password: @user_attributes[:password]
      )

      put "/users/#{@user.id}", attributes.to_json
      last_response.status.should == 400
      JSON.parse(last_response.body).should have_key('email')
    end
  end

  describe :deletion do
    before(:each) do
      @user = User.create(@user_attributes)
    end

    it 'should be successful if user is the current user' do
      log_in!(@user_attributes)
      delete "/users/#{@user.id}"
      @user.reload
      User.find(@user.id).should be_nil
    end

    it 'should not be successful if user is not the current user' do
      log_in!
      delete "/users/#{@user.id}"
      @user.reload
      User.find(@user.id).should_not be_nil
    end
  end

  describe :password_reset do
    before do
      @user = User.create(@user_attributes)
    end

    describe 'initiation' do
      it "should be successful" do
        post '/users/reset_password', @user_attributes.to_json
        last_response.status.should == 204
      end

      it 'should generate a new reset token' do
        post '/users/reset_password', @user_attributes.to_json
        @user.password_reset_token.should_not == @user.reload.password_reset_token
      end

      it 'should send a confirmation email' do
        Pony.should_receive(:mail) do |params|
          params[:to] == @user_attributes[:email]
          params[:subject].should include('Make A Theme - Password Reset')
          params[:body].should include(@user_attributes[:first_name])
          params[:body].should include('http://www.makeatheme.com/')
        end

        post '/users/reset_password', @user_attributes.to_json
      end
    end

    describe 'confirmation' do
      before(:each) do
        @user.initiate_password_reset!(12345)
        get "/users/#{@user.id}/reset_password/#{@user.password_reset_token}"
      end

      it 'should redirect the user to the index page' do
        last_response.should be_redirect
        last_response.location.should include '/'
      end

      it 'should log the user in' do
        get '/restricted'
        last_response.status.should == 201
      end
    end
  end
end

