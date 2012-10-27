
post '/session' do
  session_params = JSON.parse(request.body.read)
  unless session_params.empty?
    user = User.authenticate(session_params["email"], session_params["password"])
  else
    user = nil
  end

  unless user.nil?
    authenticate_user!(user)
    status 201
    respond_with user
  else
    status 400
    respond_with "error" => "Invalid user or password combination"
  end
end

delete '/session' do
  session_end!
  status 204
end

