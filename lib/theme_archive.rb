require 'theme_archive/wp_archive'
require 'theme_archive/html_archive'

module ThemeArchive

  def generate_archive
    #File.open(WPArchive.new(self).path) { |file| self.wp_archive = file }
    File.open(HTMLArchive.new(self).path) { |file| self.html_archive = file }
  end

  def generate_archive!
    self.generate_archive
    self.save
  end

end
