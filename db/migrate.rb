
Theme.all.each do |theme|
  Theme.collection.find(_id: theme.id).update(
    {
      '$unset' => {
        tags: true
      }
    }
  )

  puts "Tags attribute removed from theme #{theme.id}"

  Jobs::ThemeArchive.create(theme_id: theme.id)
end
