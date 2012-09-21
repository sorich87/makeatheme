class UploadThemeFiles
  @queue = :upload_theme_files

  def self.perform(theme_id, static_files)
    theme = Theme.unscoped.find(theme_id)

    return if theme.nil?

    begin
      group = theme.build_theme_file_group

      static_files.each do |static_file|
        tempfile = File.open(static_file['tempfile'], 'r')

        static_file = StaticThemeFile.new(
          :file_name => static_file['filename'],
          :file => tempfile
        )
        # Pass invalid files
        if static_file.valid?
          group.static_theme_files << static_file
          theme.static_theme_files << static_file
          static_file.save
        end

        tempfile.close
      end

      group.save
      theme.processed = true
      theme.save
    ensure
      static_files.each do |static_file|
        File.unlink(static_file['tempfile'])
      end
    end
  end
end
