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

fixture_file = File.join('.', 'spec/fixtures/themes/basic_valid_theme.zip')
unless File.exists?(fixture_file)
  puts "Fixture file not present... exiting. (#{fixture_file})"
  exit
end

# Add more samples if you want
attrs = [
  {
    name: "Easel",
    author: author,
    author_uri: "http://profiles.wordpress.org/frumph",
    description: "Just some theme I threw together ;-)",
    templates: [
      {
        name: "index",
        template: File.read('public/editor/index.html')
      },
      {
        name: "page",
        template: File.read('public/editor/page.html')
      }
    ],
    regions: [
      {
        type: 'header',
        template: File.read('public/editor/header.html')
      },
      {
        type: 'footer',
        template: File.read('public/editor/footer.html')
      },
    ]
  },
  {
    name: "Hatch",
    author: author,
    author_uri: "http://profiles.wordpress.org/griden",
    description: "Best SEO optimization AJAX, JSON, SOAP, XML and other buzzwords for your buzzness."
  }
]

Theme.all.each {|t| t.destroy }

attrs.each do |theme_attr|
  next if Theme.where(theme_attr).first
  t = Theme.create_from_zip(fixture_file, theme_attr)

  if t.valid?
    t.save
  else
    puts "Errors...:"
    t.errors.each do |key, fault|
      puts "\t#{key} #{fault}"
    end
  end
end
