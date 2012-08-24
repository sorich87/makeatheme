describe "theme upload" do
  before do
    @theme_zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
    @theme_file_upload = Rack::Test::UploadedFile.new(@theme_zip, "application/zip")
    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    @theme_attributes = {
      :name => "Some test theme",
      :description => "Some theme I threw together to make cash :-]",
      :tags => ["some", "test", "theme"]
    }

    @user = StoreUser.where(:email => @user_attributes[:email]).first
    @user = StoreUser.create!(@user_attributes) unless @user

    post '/session.json', @user_attributes.to_json
  end

  describe 'with invalid or missing attributes' do
    specify 'without an attached .zip' do
      post '/themes.json', { :theme => @theme_attributes }
      last_response.status.should == 400
    end

    specify 'without attached attributes' do
      post '/themes.json', { :file => @theme_file_upload }
      last_response.status.should == 400
    end

    specify 'with name attribute missing' do
      post '/themes.json', {
        :file => @theme_file_upload, :theme => @theme_attributes.merge(:name => nil)
      }
      last_response.status.should == 400
    end

    specify 'with name attribute missing' do
      post '/themes.json', {
        :file => @theme_file_upload, :theme => @theme_attributes.merge(:description => nil)
      }
      last_response.status.should == 400
    end
  end


  describe 'with valid attributes' do
    before do
      post '/themes.json', { :file => @theme_file_upload, :theme => @theme_attributes }
    end

    it 'should return status code 204' do
      last_response.status.should == 201
    end

    it 'should create a theme in the database' do
      @user.reload.themes.count.should > 0
    end

    it 'should return the theme as json' do
      theme = @user.reload.themes.last
      last_response.body.should == theme.to_json
    end

  end

end
