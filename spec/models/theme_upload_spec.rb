describe ThemeUpload do
  before do
    @valid_theme_zip = File.join('.', 'spec/fixtures/themes', 'basic_valid_theme.zip')
  end

  it 'should be valid given a file' do
    t = ThemeUpload.new(:archive => @valid_theme_zip)
    t.should be_valid
    t.archive.should_not be_nil
  end

  it 'should be invalid without a file' do
    t = ThemeUpload.new
    t.should_not be_valid
    t.errors[:archive].should_not be_nil
  end

  it 'should successfully save' do
    t = ThemeUpload.new(:archive => @valid_theme_zip)
    t.save.should be_true
  end

  it 'should retrieve the file after save' do
    t = ThemeUpload.new(:archive => @valid_theme_zip)
    t.save!

    b = ThemeUpload.find(t.id)
    b.archive.should_not be_nil
  end
end
