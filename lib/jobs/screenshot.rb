class Screenshot
  @queue = :screenshots

  def self.perform(theme_id, url)
    theme = Theme.unscoped.find(theme_id)
    # TODO: Warn?
    return if theme.nil?

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
