class ProcessTheme
  @queue = :process_theme

  def self.perform(intermediate_id)
    intermediate = ThemeUpload.where(:id => intermediate_id).first
    return if intermediate.nil?

    tempfile = Tempfile.new(intermediate.archive.basename)
    tempfile.write(intermediate.archive.data)
    tempfile.rewind
    begin
      # Process and create the theme
      theme = Theme.create_from_zip(tempfile, author: intermediate.author)
      if theme.valid?
        theme.save

        url = "#{intermediate.url}/#{theme.id}"
        intermediate.destroy

        self.generate_screenshot(theme, url)
      else
        # TODO: Give user errors
      end
    ensure
      tempfile.close
      tempfile.unlink
    end
  end

  def self.generate_screenshot(theme, url)
    script = File.join(settings.root, 'script', 'rasterize.js')

    tmpdir = Dir.mktmpdir
    path = File.join(tmpdir, 'screenshot.png')

    `phantomjs #{script} #{url} #{path}`
    if $?.to_i == 0
      File.open(path) do |file|
        theme.screenshot = file
        theme.save!
      end
      File.delete(path)
    else
      # TODO: Add error to log
      # How to get some useful info form phantomjs?
    end
  end
end
