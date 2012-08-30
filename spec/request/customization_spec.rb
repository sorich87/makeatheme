require 'json'

describe "Theme customization" do
  before do
    @theme_attributes = {
      name: "Some theme",
      author: StoreUser.first.id,
      description: "Some theme."
    }

    @theme = Theme.where(@theme_attributes.merge(:archive => nil)).first
    unless @theme.nil?
      zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
      @theme = Theme.create_from_zip(zip, @theme_attributes)
    end

    @json = File.read('./spec/request/customization_request.json')

    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    @user = StoreUser.find_or_create_by(@user_attributes)
  end

  it 'should require authentication' do
    post "/themes/#{@theme.id}/customize.json", @json
    last_response.status.should == 401
  end

  context "as an authenticated user" do
    before do
      post '/session.json', @user_attributes.to_json
      post "/themes/#{@theme.id}/customize.json", @json
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
