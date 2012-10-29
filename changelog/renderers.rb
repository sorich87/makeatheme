require 'rss/maker'

module Changelog
  module Renderers
    def render_feed(version)
      endpoint = if version == "atom" then "atom" else "rss" end
      url = "http://localhost:5000/changelog/#{endpoint}"

      RSS::Maker.make(version) do |maker|
        maker.channel.author = 'ThemeMy'
        maker.channel.updated = Time.now.to_s
        maker.channel.about = url
        maker.channel.link = url
        maker.channel.description = 'Follow features additions and bug fixes to ThemeMy'
        maker.channel.title = 'ThemeMy Changelog'

        issues.each do |issue|
          maker.items.new_item do |item|
            item.title = issue.title
            item.description = issue.body
            item.updated = issue.closed_at
            item.link = "#{url}##{issue.number}"
          end
        end
      end.to_s
    end

    def issues
      Struct.new("Issue", :number, :title, :body, :closed_at)
      [Struct::Issue.new(12345, "Testing", "Yes", Time.now.to_s)]
    end
  end
end
