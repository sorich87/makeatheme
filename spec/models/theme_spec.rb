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
  it { should have_and_belong_to_many(:theme_file_groups) }

  it { should validate_attachment_presence(:archive) }
  it { should validate_attachment_content_type(:archive).allowing('application/zip') }
  it { should validate_attachment_size(:archive).less_than(1.megabyte) }

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

    context 'theme file group' do
      it 'should create a theme file group' do
        @theme.theme_file_group.should_not be_nil
      end

      it 'should build that group correctly so that it has static files' do
        @theme.theme_file_group.static_theme_files.count.should > 0
      end

      it 'should reference itself in the group' do
        @theme.theme_file_group.theme_ids.should include(@theme.id)
      end

      it 'should be references in the static files' do
        @theme.theme_file_group.static_theme_files.first.theme.should == @theme
      end
    end
  end
end
