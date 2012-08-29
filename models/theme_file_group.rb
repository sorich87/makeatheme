require 'static_theme_file'

class ThemeFileGroup
  include Mongoid::Document

  has_many :static_theme_files
  has_many :themes

  def static_files_dir
    s = self.static_theme_files.first
    s.file.url.split(s.file_name).first[0..-2]
  end
end
