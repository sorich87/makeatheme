Pony.options = {
  :via => :smtp,
  :via_options => {
    :address        => 'stmp.sendgrid.net',
    :port           => '587',
    :authentication => :plain,
    :user_name      => ENV['SENDGRID_USERNAME'],
    :password       => ENV['SENDGRID_PASSWORD'],
    :domain         => 'heroku.com',
    :enable_starttls_auto => true
  },
  :charset => 'utf-8'
}
