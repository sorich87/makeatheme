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

  desc "Make changes to database schema"
  task :migrate do
    migration_file = File.join(settings.root, "db", "migrate.rb")
    load(migration_file) if File.exist?(migration_file)
  end

end

namespace :archives do

  desc "Rebuild theme archives"
  task :rebuild do
    Theme.unscoped.all.each do |theme|
      Jobs::ThemeArchive.create(theme_id: theme.id)
      puts "Archive job queued for theme #{theme.id}"
    end
  end

end
