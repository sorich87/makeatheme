
Theme.all.each do |theme|
  theme.update(
    {
      '$unset' => {
        archive_file_name: true,
        archive_content_type: true,
        archive_file_size: true,
        archive_updated_at: true
      }
    }
  )

  puts "Archive attributes removed for theme #{theme.id}"

  Jobs::ThemeArchive.create(theme_id: theme.id)
end
