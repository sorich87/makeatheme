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
    new_theme = Theme.new_from_zip(theme_file, theme_attr)

    theme = Theme.where(name: new_theme.name, author_id: author.id).first
    if theme.nil?
      theme = new_theme
    else
      theme.write_attributes(new_theme.attributes)
      new_theme.assets.each do |asset|
        theme.assets << asset
      end
      theme.blocks = new_theme.blocks
      theme.regions = new_theme.regions
      theme.templates = new_theme.templates
    end

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
