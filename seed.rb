require './app'

# Add more samples if you want
attrs = [
  {
    name: "Easel",
    author: "Frumph",
    author_uri: "http://profiles.wordpress.org/frumph",
  },
  {
    name: "Hatch",
    author: "Griden",
    author_uri: "http://profiles.wordpress.org/griden"
  }
]

attrs.each do |theme_attr|
  Theme.find_or_create_by(theme_attr)
end
