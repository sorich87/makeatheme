
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

get '/users/:user_id/reset_password/:reset_token' do
  user = StoreUser.where(:id => params[:user_id], :password_reset_token => params[:reset_token])

  erb :reset_password
end

put '/users/:email/initiate_password_reset', provides: [:json] do
  user = StoreUser.where(:email => params[:email]).first

  if user
    user.generate_password_reset_token!

    Pony.mail :to => user.email,
              :subject => 'Password reset',
              :from => 'ulrich@thememy.com',
              :body => erb(:'emails/password_reset', :locals => {:user => user})

    status 204
  else
    status 404
  end
end

put '/users/:token/reset_password', provides: [:json] do
  user = StoreUser.where(:password_reset_token => params[:token]).first

  if user
    authenticate_user!(user)

    status 200
    body user.to_json
  else
    status 404
  end
end
