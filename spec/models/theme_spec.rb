describe Theme do
  before do
    @valid_theme_zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
  end

  specify 'sample .zip should exist' do
    File.exists?(@valid_theme_zip).should be_true
  end

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:author) }
  it { should validate_presence_of(:author_uri) }
  it { should validate_presence_of(:description) }

  it { should embed_many(:theme_files) }
end
