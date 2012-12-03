require 'open-uri'

module Jobs
  class ThemeArchive
    include Sidekiq::Worker
    include Sidekiq::Status::Worker

    def perform(theme_id)
      theme = Theme.unscoped.where(id: theme_id).first
      return if theme.nil?

      theme_url = "http://#{settings.editor_domain}/themes/#{theme.id}/preview"
      screenshot = open("http://#{settings.capture_domain}/?url=#{theme_url}", 'rb')

      if screenshot
        def screenshot.original_filename; 'screenshot.png'; end

        theme.screenshot = screenshot
        theme.save
        theme.generate_archive!
      end
    end
  end
end
