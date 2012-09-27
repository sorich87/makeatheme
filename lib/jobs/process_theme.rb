module Jobs
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
        if theme.save

          Resque.enqueue(Jobs::ThemeArchive, theme.id, intermediate.url)
          intermediate.destroy
        else
          # TODO: Give user errors
        end
      ensure
        tempfile.close
        tempfile.unlink
      end
    end
  end
end
