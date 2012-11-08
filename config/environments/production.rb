set :editor_domain, 'www.makeatheme.com'
set :capture_domain, 'capture.makeatheme.com'

Pony.options = {
  :via => :smtp,
  :via_options => {
    :address        => 'smtp.mandrillapp.com',
    :port           => '587',
    :authentication => :plain,
    :user_name      => ENV['MANDRILL_USERNAME'],
    :password       => ENV['MANDRILL_APIKEY'],
    :enable_starttls_auto => true
  },
  :charset => 'utf-8'
}
