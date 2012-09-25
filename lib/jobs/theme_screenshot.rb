class ThemeScreenshot
  @queue = :theme_screenshot

  def self.perform(theme_id, url)
    theme = Theme.unscoped.where(id: theme_id).first
    return if theme.nil?

    theme_url = "#{url}/#{theme.id}"
    script = File.join(settings.root, 'script', 'rasterize.js')

    tmpdir = Dir.mktmpdir
    path = File.join(tmpdir, 'screenshot.png')

    `phantomjs #{script} #{theme_url} #{path}`
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
