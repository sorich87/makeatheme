require './app'
require 'resque/tasks'

namespace :db do

  desc "Drop all collections except the system collections"
  task :purge do
    ::Mongoid.purge!
  end

  desc "Load the seed data from db/seed.rb"
  task :seed do
    seed_file = File.join(settings.root, "db", "seed.rb")
    load(seed_file) if File.exist?(seed_file)
  end

  desc "Delete data and seed"
  task :reseed => [ "db:purge", "db:seed" ]

end
