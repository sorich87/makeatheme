get '/users' do
  admin_only!

  @users = User.all.order_by([:email]).page(params[:page])

  respond_with results: @users, pagination: json_pagination_for(@users)
end

post '/users' do
  user_params = JSON.parse(request.body.read)
  user_params.slice!("first_name", "last_name", "email", "password")
  user = User.new(user_params)
  if user.valid?
    user.save
    authenticate_user!(user)

    Pony.mail :to => user.email,
              :subject => 'Start Making your Themes',
              :from => 'Make A Theme <notifications@makeatheme.com>',
              :reply_to => 'support@makeatheme.com',
              :html_body => erb(:'emails/user_registration.html', :locals => {:user => user}),
              :body => erb(:'emails/user_registration.txt', :locals => {:user => user})

    status 201
    body user.to_json
  else
    status 400
    body user.errors.to_json
  end
end

put '/users/:id' do
  user = User.find(params[:id])

  admin_or_owner_only!(user)

  params = JSON.parse(request.body.read, symbolize_names: true)

  unless user.has_password?(params[:current_password])
    status 400
    body({current_password: ["invalid"]}.to_json)
    return
  end

  params.slice!(:first_name, :last_name, :email, :password)

  if user.update_attributes(params)
    status 202
    body user.to_json
  else
    status 400
    body user.errors.to_json
  end
end

delete '/users/:id' do
  user = User.find(params[:id])

  admin_or_owner_only!(user)

  user.destroy
end

post '/users/reset_password' do
  params = JSON.parse(request.body.read, symbolize_names: true)
  user = User.where(:email => params[:email]).first

  if user
    user.initiate_password_reset!(params[:password])
    locals = {
      user: user,
      reset_url: url("/users/#{user.id}/reset_password/#{user.password_reset_token}")
    }

    Pony.mail :to => user.email,
              :subject => 'Make A Theme - Password Reset',
              :from => 'Make A Theme <notifications@makeatheme.com>',
              :reply_to => 'contact@makeatheme.com',
              :html_body => erb(:'emails/password_reset.html', locals: locals),
              :body => erb(:'emails/password_reset.txt', locals: locals)
  end

  halt 204
end

get '/users/:user_id/reset_password/:reset_token' do
  user = User.where(:id => params[:user_id], :password_reset_token => params[:reset_token]).first

  halt 404 unless user

  if user.reset_password!
    authenticate_user!(user)
    redirect to '/'
  else
    status 403
    respond_with error: "Password reset token expired"
  end
end

