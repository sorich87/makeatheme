author = User.first

unless author
  author = User.create(
    first_name: "Emil",
    last_name: "Ahlbaeck",
    email: "e.ahlback@gmail.com",
    password: "push.ly"
  )
end

Dir[File.join(File.dirname(__FILE__), 'themes', '*.zip')].each do |theme_file|
  attrs = [
    {
      author: author,
      listed: true
    }
  ]

  attrs.each do |theme_attr|
    theme = Theme.new_from_zip(theme_file, theme_attr)

    old_theme = Theme.where(name: theme.name, author_id: author.id).first
    theme[:_id] = old_theme._id unless old_theme.nil?

    if theme.save
      Jobs::ThemeArchive.create(theme_id: theme.id)
    else
      puts "Errors...:"
      theme.errors.each do |key, fault|
        puts "\t#{key} #{fault}"
      end
    end
  end
end
