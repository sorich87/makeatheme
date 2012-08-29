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
  it { should belong_to(:theme_file_group) }

  it { should validate_attachment_presence(:archive) }
  it { should validate_attachment_content_type(:archive).allowing('application/zip') }
  it { should validate_attachment_size(:archive).less_than(1.megabyte) }

  it 'should respond to create_from_zip' do
    Theme.should respond_to(:create_from_zip)
  end
  it { should respond_to(:fork!) }
  it { should respond_to(:needed_theme_files) }

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

  context 'forking' do
    before do
      @theme = Theme.create_from_zip(@valid_theme_zip, @valid_attributes)
      @theme.save

      @fork = @theme.fork!
    end

    it 'should create a new valid theme' do
      @fork.author = StoreUser.first
      @fork.should be_valid
    end

    it 'should have its parent set properly' do
      @fork.parent.should == @theme
    end

    it 'should have the same file group' do
      @fork.theme_file_group.should == @theme.theme_file_group
    end

    it 'should have the same regions' do
      @fork.regions.should == @theme.regions
    end

    it 'should have the same templates' do
      @fork.templates.should == @theme.templates
    end

    describe 'static theme files' do
      it 'should have the same static files' do
        @fork.static_theme_file_ids == @theme.static_theme_file_ids
      end

      it 'should not have any static files' do
        @fork.static_theme_files.should be_empty
      end

      it 'should have the same needed files as its parent' do
        #@fork.needed_theme_files.should == @theme.static_theme_files
        @fork.needed_theme_files.count.should > 0
      end
    end
  end
end
