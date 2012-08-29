require 'json'

describe "Theme customization" do
  before do
    @theme_attributes = {
      name: "Some theme",
      author: "Test User",
    }

    @theme = Theme.find_or_create_by(@theme_attributes)
  end

  it 'should work lol' do
    json = File.read('./spec/request/customization_request.json')
    post "/themes/#{@theme.id}/customize.json", json
    (2+3).should == 4
    # This is barely a test, it's mostly to send the request and find exceptions.
    # It needs to be tested somehow, but at this point (without theme uploads)
    # I'm not sure if we need to focus on that.
  end
end
