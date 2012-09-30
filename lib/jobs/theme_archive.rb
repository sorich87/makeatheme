require 'resque-lock-timeout'

module Jobs
  class ThemeArchive
    include Resque::Plugins::Status
    extend Resque::Plugins::LockTimeout

    @queue = :theme_archive

    def perform
      theme = Theme.unscoped.where(id: options['theme_id']).first
      return if theme.nil?

      theme_url = "http://#{settings.domain}/preview/#{theme.id}"
      script = File.join(settings.root, 'script', 'rasterize.js')

      path = File.join(Dir.mktmpdir, 'screenshot.png')

      `phantomjs #{script} #{theme_url} #{path}`
      if $?.to_i == 0
        File.open(path) do |file|
          theme.screenshot = file
          theme.save
          theme.generate_archive!
        end
        File.delete(path)

        completed theme.to_json
      else
        # TODO: Add error to log
        # How to get some useful info form phantomjs?
      end
    end

    def self.redis_lock_key(uuid, options = {})
      ['lock', name, options.to_s].compact.join(':')
    end
  end
end
