require './app'

# Add more samples if you want
attrs = [
  {
    name: "Easel",
    author: "Frumph",
    author_uri: "http://profiles.wordpress.org/frumph",
    description: "Just some theme I threw together ;-)"
  },
  {
    name: "Hatch",
    author: "Griden",
    author_uri: "http://profiles.wordpress.org/griden",
    description: "Best SEO optimization AJAX, JSON, SOAP, XML and other buzzwords for your buzzness."
  }
]

attrs.each do |theme_attr|
  Theme.find_or_create_by(theme_attr)
end
