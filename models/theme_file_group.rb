require 'asset'

class ThemeFileGroup
  include Mongoid::Document

  field :original_file_ids, type: Array

  has_many :assets, inverse_of: :group, :dependent => :destroy
  has_many :themes

  before_create :add_original_files
  before_destroy :check_theme_amount

  def static_files_dir
    s = self.assets.first
    s.file.url.split(s.file_name).first[0..-2]
  end

  def original_files
    self.assets.criteria.for_ids(self.original_file_ids)
  end

  private
  def add_original_files
    self.original_file_ids = self.asset_ids
  end

  # Check how many themes exist, if there is only one we can remove ourselves.
  # If not the group needs to stay.
  def check_theme_amount
    return false if self.themes.count > 1
  end
end
