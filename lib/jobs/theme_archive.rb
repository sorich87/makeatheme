require 'resque-lock-timeout'
require 'open-uri'

module Jobs
  class ThemeArchive
    include Resque::Plugins::Status
    extend Resque::Plugins::LockTimeout

    @queue = :theme_archive

    def perform
      theme = Theme.unscoped.where(id: options['theme_id']).first
      return if theme.nil?

      theme_url = "http://#{settings.editor_domain}/themes/#{theme.id}/preview"
      screenshot = open("http://#{settings.capture_domain}/?url=#{theme_url}", 'rb')

      if screenshot
        def screenshot.original_filename; 'screenshot.png'; end

        theme.screenshot = screenshot
        theme.save
        theme.generate_archive!

        completed theme.to_json
      else
        # TODO: Add error to log
        # How to get some useful info form phantomjs?
        failed
      end
    end

    def self.redis_lock_key(uuid, options = {})
      ['lock', name, options.to_s].compact.join(':')
    end
  end
end
