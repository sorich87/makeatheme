describe ThemeFile do
  it { should validate_presence_of(:file_name) }
  it { should validate_presence_of(:file_content) }
end
