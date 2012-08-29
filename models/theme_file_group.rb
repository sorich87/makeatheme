require 'static_theme_file'

class ThemeFileGroup
  include Mongoid::Document

  field :original_file_ids, type: Array

  has_many :static_theme_files
  has_many :themes

  before_create :add_original_files

  def static_files_dir
    s = self.static_theme_files.first
    s.file.url.split(s.file_name).first[0..-2]
  end

  def original_files
    self.static_theme_files.criteria.for_ids(self.original_file_ids)
  end

  private
  def add_original_files
    self.original_file_ids = self.static_theme_file_ids
  end
end
