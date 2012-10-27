require 'json'

describe "Theme customization" do
  before do
    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    @user = User.create(@user_attributes)

    @theme_attributes = {
      name: "Some theme",
      author: @user,
      description: "Some theme."
    }

    if @theme.nil?
      zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
      @theme = Theme.new_from_zip(zip, @theme_attributes)
      @theme.save!
    end

    @json = File.read('./spec/request/customization_request.json')
  end

  it 'should require authentication' do
    put "/themes/#{@theme.id}", @json
    last_response.status.should == 401
  end

  context "as an authenticated user" do
    before do
      Kernel.stub!(:open)

      post '/session', @user_attributes.to_json
      put "/themes/#{@theme.id}", @json
      @theme.reload
    end

    it 'should be successful (status 201)' do
      last_response.status.should == 201
    end

    it 'should create a fork' do
      @theme.forks.count.should > 0
    end
  end
end
