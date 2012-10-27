describe ThemeFileGroup do
  it { should have_many(:assets) }
  it { should have_many(:themes) }
  it { should respond_to(:original_files) }

  describe 'original files' do
    before do
      @valid_theme_zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
      @valid_attributes = {
        :name => "Some name",
        :description => "Description of some theme",
        :author => User.first,
      }
      @theme = Theme.new_from_zip(@valid_theme_zip, @valid_attributes)
      @theme.save
      @group = @theme.theme_file_group
    end

    specify "should be the same as the Theme's static files" do
      @group.original_file_ids.should == @theme.asset_ids
    end

    specify "should return instances of the static files" do
      @group.original_files.should == @theme.assets
    end
  end
end
