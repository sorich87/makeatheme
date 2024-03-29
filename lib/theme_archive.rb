require_relative 'theme_archive/wp_archive'
require_relative 'theme_archive/html_archive'

module ThemeArchive

  def generate_archive
    File.open(HTMLArchive.new(self).path) { |file| self.html_archive = file }
    File.open(WPArchive.new(self).path) { |file| self.wp_archive = file }
  end

  def generate_archive!
    self.generate_archive
    self.save
  end

end
