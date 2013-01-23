describe Theme do
  before do
    @user = User.new(
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    )

    @valid_theme_zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
    @valid_attributes = {
      :author => @user
    }

    @theme = Theme.new_from_zip(@valid_theme_zip, @valid_attributes)
    @theme.save
  end

  after do
    @user.destroy
    @theme.destroy
  end

  specify 'sample .zip should exist' do
    File.exists?(@valid_theme_zip).should be_true
  end

  it { should be_timestamped_document }

  it { should have_fields(:name, :uri, :version, :description, :listed, :style) }
  it { should have_fields(:screenshot_file_name, :screenshot_content_type) }
  it { should have_fields(:wp_archive_file_name, :wp_archive_content_type) }
  it { should have_fields(:screenshot_file_size, :wp_archive_file_size).of_type(Integer) }
  it { should have_fields(:screenshot_updated_at, :wp_archive_updated_at).of_type(DateTime) }

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:author) }

  it { should belong_to(:author).of_type(User) }
  it { should belong_to(:parent).of_type(Theme) }

  it { should embed_many(:blocks) }
  it { should embed_many(:regions) }
  it { should embed_many(:templates) }

  it { should have_many(:forks).of_type(Theme) }

  it { should have_and_belong_to_many(:assets).with_autosave }

  it { should validate_attachment_content_type(:wp_archive).allowing('application/zip') }
  it { should validate_attachment_size(:wp_archive).less_than(1.megabyte) }

  it 'should have import methods' do
    Theme.should respond_to(:new_from_zip)
    Theme.should respond_to(:create_from_zip)
  end
  it { should respond_to(:generate_archive) }
  it { should respond_to(:generate_archive!) }
  it { should respond_to(:fork) }
  it { should respond_to(:fork!) }
  it { should respond_to(:forks) }
  it { should respond_to(:fork?) }

  describe '.new_from_zip' do
    it 'should work given a valid .zip file' do
      @theme.should be_persisted
    end

    it 'should have templates' do
      @theme.templates.count.should > 0
    end

    it 'should have regions' do
      @theme.regions.count.should > 0
    end

    it 'should not be a fork' do
      @theme.fork?.should be_false
    end
  end

  context 'forking' do
    before do
      @fork = @theme.fork
    end

    after do
      @fork.destroy
    end

    it 'should create a new valid theme' do
      @fork.author = @user
      @fork.should be_valid
    end

    it 'should have its parent set properly' do
      @fork.parent.should == @theme
    end

    it 'should be a fork' do
      @fork.fork?.should be_true
    end

    it 'should have the same regions' do
      @fork.regions.length.should == @theme.regions.length
    end

    it 'should have the same templates' do
      @fork.templates.length.should == @theme.templates.length
    end

    it "should make the new fork available in the original theme's list of forks" do
      @theme.forks.should include(@fork)
    end

    describe 'static theme files' do
      it 'should have the same static files' do
        @fork.asset_ids == @theme.asset_ids
      end

      it 'should not have any static files' do
        @fork.assets.should be_empty
      end
    end
  end

  describe 'destroy' do
  end
end
