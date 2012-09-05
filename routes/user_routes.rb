
post '/users' do
  user_params = JSON.parse(request.body.read)
  user_params.slice!("first_name", "last_name", "email", "password")
  user = StoreUser.new(user_params)
  if user.valid?
    user.save
    authenticate_user!(user)

    Pony.mail :to => user.email,
              :subject => 'Welcome aboard',
              :from => 'ulrich@thememy.com',
              :body => erb(:'emails/user_registration', :locals => {:user => user})

    status 201
    body user.to_json
  else
    status 400
    body user.errors.to_json
  end
end

