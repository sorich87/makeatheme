require './app'

author = StoreUser.first

unless author
  author = StoreUser.create(
    first_name: "Emil",
    last_name: "Ahlbaeck",
    email: "e.ahlback@gmail.com",
    password: "push.ly"
  )
end

fixture_file = File.join(File.dirname(__FILE__), 'themes', 'twentyelevenx.zip')
unless File.exists?(fixture_file)
  puts "Fixture file not present... exiting. (#{fixture_file})"
  exit
end

# Add more samples if you want
attrs = [
  {
    name: "Twenty Eleven X",
    author: author,
    description: "The 2011 WordPress theme adapted to ThemeMy online theme editor.",
    listed: true
  }
]

Theme.all.each {|t| t.destroy }

attrs.each do |theme_attr|
  next if Theme.where(theme_attr).first
  t = Theme.new_from_zip(fixture_file, theme_attr)

  if t.valid?
    t.save
  else
    puts "Errors...:"
    t.errors.each do |key, fault|
      puts "\t#{key} #{fault}"
    end
  end
end
