
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

post '/users/reset_password' do
  params = JSON.parse(request.body.read, symbolize_names: true)
  user = StoreUser.where(:email => params[:email]).first

  if user
    user.initiate_password_reset!(params[:password])
    locals = {
      user: user,
      reset_url: url("/users/#{user.password_reset_token}/reset_password")
    }

    Pony.mail :to => user.email,
              :subject => 'ThemeMy Password Reset',
              :from => 'no-reply@thememy.com',
              :body => erb(:'emails/password_reset', locals: locals)
  end

  halt 204
end

get '/users/:token/reset_password' do
  user = StoreUser.where(:password_reset_token => params[:token]).first

  halt 404 unless user

  if user.reset_password!
    authenticate_user!(user)
    redirect to '/'
  else
    status 403
    respond_with error: "Password reset token expired"
  end
end
