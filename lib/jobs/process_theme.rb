module Jobs
  class ProcessTheme
    include Resque::Plugins::Status

    @queue = :process_theme

    def perform
      intermediate = ThemeUpload.where(:id => options['intermediate_id']).first
      return if intermediate.nil?

      tempfile = Tempfile.new(intermediate.archive.basename)
      tempfile.write(intermediate.archive.data)
      tempfile.rewind
      begin
        # Process and create the theme
        theme = Theme.create_from_zip(tempfile, author: intermediate.author)
        if theme.save
          Jobs::ThemeArchive.create(theme_id: theme.id, url: intermediate.url)
          intermediate.destroy

          completed theme.to_json
        else
          failed theme.errors.to_json
        end
      ensure
        tempfile.close
        tempfile.unlink
      end
    end
  end
end
