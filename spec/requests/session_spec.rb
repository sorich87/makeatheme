describe :session do
  after(:each) do
    log_out!
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

  describe 'access to restricted areas' do
    describe 'as unauthenticated user' do
      it 'should not be OK' do
        get '/restricted'
        last_response.status.should == 401
      end

      it 'should not be OK for admin or owner only areas' do
        get "/admin_or_owner_only/#{current_user.id}"
        last_response.status.should == 401
      end

      it 'should not be OK for admin only areas' do
        get '/admin_only'
        last_response.status.should == 401
      end
    end

    describe 'as authenticated user' do
      before(:each) do
        log_in!
      end

      it 'should be OK' do
        get '/restricted'
        last_response.status.should == 200
      end

      it 'should be OK for admin or owner only areas' do
        get "/admin_or_owner_only/#{current_user.id}"
        last_response.status.should == 200
      end

      it 'should not be OK for admin only areas' do
        get '/admin_only'
        last_response.status.should == 401
      end
    end

    describe 'as admin' do
      before(:each) do
        admin_log_in!
      end

      it 'should be OK' do
        get '/restricted'
        last_response.status.should == 200
      end

      it 'should be OK for admin or owner only areas' do
        get "/admin_or_owner_only/#{current_user.id}"
        last_response.status.should == 200
      end

      it 'should be OK for admin only areas' do
        get '/admin_only'
        last_response.status.should == 200
      end
    end
  end

  describe 'access to other users area' do
    it 'should be OK for admins' do
      user = User.create!(
        email: "test_user@example.com",
        password: "test_password",
        first_name: "Test",
        last_name: "User"
      )

      admin_log_in!
      get "/admin_or_owner_only/#{user.id}"
      last_response.status.should == 200
    end
  end
end
