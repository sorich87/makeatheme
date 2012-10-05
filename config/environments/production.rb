set :domain, 'www.thememy.com'

Pony.options = {
  :via => :smtp,
  :via_options => {
    :address        => 'smtp.mandrillapp.com',
    :port           => '587',
    :authentication => :plain,
    :user_name      => ENV['MANDRILL_USERNAME'],
    :password       => ENV['MANDRILL_APIKEY'],
    :domain         => 'heroku.com',
    :enable_starttls_auto => true
  },
  :charset => 'utf-8'
}
