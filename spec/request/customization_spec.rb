require 'json'

describe "Theme customization" do
  before do
    @theme_attributes = {
      name: "Some theme",
      author: "Test User",
    }

    @theme = Theme.find_or_create_by(@theme_attributes)

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
    last_response.status.should == 403
  end

  context "as an authenticated user" do
    before do
      post '/session.json', @user_attributes.to_json
    end

    # TODO: Think of a way to test the .zip
    # returned in the JSON response
    it 'should be successful (status 200)' do
      post "/themes/#{@theme.id}/customize.json", @json
      last_response.status.should == 200
    end
  end
end
