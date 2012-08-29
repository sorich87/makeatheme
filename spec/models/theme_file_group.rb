describe ThemeFileGroup do

  it { should embed_many(:static_theme_files) }
  it { should have_many(:themes) }
end
