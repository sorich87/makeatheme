source :rubygems

ruby '1.9.3'

gem 'sinatra'
gem 'mongoid', '~> 3.0.0'
gem 'activesupport'
gem 'kaminari'
gem 'bcrypt-ruby'
gem 'sinatra-session'
gem 'sinatra-respond_to'
gem 'paperclip', '~> 3.1.4'
gem 'fog', '~> 1.5.0'
gem 'handlebars', '~> 0.3.1'
gem "rubyzip", "~> 0.9.9"
gem "pony", "~> 1.4"
gem 'nokogiri', '~> 1.5.0'

group :test, :development do
  gem 'rspec', '~> 2.11.0'
  # Automatic reload when editing files
  gem 'shotgun'
  gem 'mongoid-rspec'
end

group :production do
  gem 'thin'
end
