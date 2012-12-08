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
  new_theme = Theme.new_from_zip(theme_file, author: author, listed: true)

  theme = Theme.where(name: new_theme.name, author_id: author.id).first
  if theme.nil?
    theme = new_theme
  else
    theme.write_attributes(new_theme.attributes)
    theme.asset_ids = []
    new_theme.assets.each do |asset|
      theme.asset_ids << asset.id
      asset.save
    end
    theme.blocks = new_theme.blocks
    theme.regions = new_theme.regions
    theme.templates = new_theme.templates
  end

  if theme.save
    Jobs::ThemeArchive.perform_async(theme.id)
  else
    puts "Errors...:"
    theme.errors.each do |key, fault|
      puts "\t#{key} #{fault}"
    end
  end
end
