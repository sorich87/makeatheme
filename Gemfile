source :rubygems

ruby '1.9.3'

gem 'sinatra', '~> 1.3.3'
gem 'mongoid', '~> 3.0.0'
gem 'mongoid-grid_fs', '~> 1.3.2'
gem 'activesupport'
gem 'kaminari'
gem 'bcrypt-ruby'
gem 'sinatra-session'
gem 'sinatra-contrib'
gem 'paperclip', '~> 3.1.4'
gem 'fog', '~> 1.5.0'
gem "rubyzip", "~> 0.9.9"
gem "pony", "~> 1.4"
gem 'nokogiri', '~> 1.5.0'
gem 'liquid'
gem 'resque', '~> 1.22.0'

group :test, :development do
  gem 'rspec', '~> 2.11.0'
  # Automatic reload when editing files
  gem 'shotgun'
  gem 'mongoid-rspec'
  gem 'database_cleaner'
  gem 'simplecov', :require => false
end

group :production do
  gem 'thin'
end
