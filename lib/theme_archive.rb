require_relative 'theme_archive/wp_archive'

module ThemeArchive

  def generate_archive
    File.open(WPArchive.new(self).path) { |file| self.wp_archive = file }
  end

  def generate_archive!
    self.generate_archive
    self.save
  end

end
