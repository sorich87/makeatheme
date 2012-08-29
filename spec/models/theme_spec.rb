describe Theme do
  before do
    @valid_theme_zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
    @valid_attributes = {
      :name => "Some name",
      :description => "Description of some theme",
      :author => StoreUser.first,
    }
  end

  specify 'sample .zip should exist' do
    File.exists?(@valid_theme_zip).should be_true
  end

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:author) }
  it { should validate_presence_of(:description) }

  it { should belong_to(:author) }
  it { should embed_many(:static_theme_files) }

  it { should validate_attachment_presence(:archive) }
  it { should validate_attachment_content_type(:archive).allowing('application/zip') }

  describe '.create_from_zip' do
    before do
      @theme = Theme.create_from_zip(@valid_theme_zip, @valid_attributes)
      @theme.save
    end

    it 'should work given a valid .zip file' do
      @theme.should be_persisted
    end

    it 'should create embedded theme templates' do
      @theme.templates.count.should > 0
    end

    it 'should create embedded theme regions' do
      @theme.regions.count.should > 0
    end

    it 'should create embedded static theme files' do
      @theme.static_theme_files.count.should > 0
    end
  end
end
