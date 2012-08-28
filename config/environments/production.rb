Pony.options = {
  :via => :smtp,
  :via_options => {
    :host           => 'app.push.ly',
    :address        => 'stmp.sendgrid.net',
    :port           => '587',
    :authentication => :plain,
    :user_name      => ENV['SENDGRID_USERNAME'],
    :password       => ENV['SENDGRID_PASSWORD'],
    :domain         => 'heroku.com'
  },
  :charset => 'utf-8'
}
