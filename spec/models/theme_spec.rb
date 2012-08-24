describe Theme do
  before do
    @valid_theme_zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
    @valid_attributes = {
      :name => "Some name",
      :description => "Description of some theme",
      :author => StoreUser.first,
      :author_uri => "http://localhost"
    }
  end

  specify 'sample .zip should exist' do
    File.exists?(@valid_theme_zip).should be_true
  end

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:author) }
  it { should validate_presence_of(:author_uri) }
  it { should validate_presence_of(:description) }

  it { should embed_many(:theme_files) }
  it { should belong_to(:author) }

  describe '.create_from_zip' do
    before do
      @theme = Theme.create_from_zip(@valid_theme_zip, @valid_attributes)
      @theme.save
    end

    it 'should work given a valid .zip file' do
      @theme.should be_persisted
    end

    it 'should create embedded theme files' do
      @theme.theme_files.count.should > 0
    end

    it 'should create embedded static theme files' do
      @theme.static_theme_files.count.should > 0
    end
  end
end
