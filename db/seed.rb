author = StoreUser.first

unless author
  author = StoreUser.create(
    first_name: "Emil",
    last_name: "Ahlbaeck",
    email: "e.ahlback@gmail.com",
    password: "push.ly"
  )
end

theme_file = File.join(File.dirname(__FILE__), 'themes', 'twentyelevenx.zip')
unless File.exists?(theme_file)
  puts "Theme file not present... exiting. (#{theme_file})"
  exit
end

# Add more samples if you want
attrs = [
  {
    author: author,
    listed: true
  }
]

attrs.each do |theme_attr|
  next if Theme.where(theme_attr).first
  t = Theme.create_from_zip(theme_file, theme_attr)

  if t.valid?
    t.save
  else
    puts "Errors...:"
    t.errors.each do |key, fault|
      puts "\t#{key} #{fault}"
    end
  end
end
