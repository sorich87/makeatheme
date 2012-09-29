module Jobs
  class ThemeArchive
    include Resque::Plugins::Status

    @queue = :theme_archive

    def perform
      theme = Theme.unscoped.where(id: options['theme_id']).first
      return if theme.nil?

      theme_url = "#{options['url']}/#{theme.id}"
      script = File.join(settings.root, 'script', 'rasterize.js')

      path = File.join(Dir.mktmpdir, 'screenshot.png')

      `phantomjs #{script} #{theme_url} #{path}`
      if $?.to_i == 0
        File.open(path) do |file|
          theme.screenshot = file
          theme.generate_archive!
        end
        File.delete(path)
      else
        # TODO: Add error to log
        # How to get some useful info form phantomjs?
      end
    end
  end
end
