
post '/session.json' do
  request_body = request.body.read
  if !request_body.empty?
    session_params = JSON.parse(request_body)
    user = StoreUser.authenticate(session_params["email"], session_params["password"])
  else
    user = nil
  end

  unless user.nil?
    authenticate_user!(user)
    status 201
    body user.to_json
  else
    status 400
    body( { "error" => "Invalid user or password combination" }.to_json )
  end
end

delete '/session.json' do
  session_end!
  status 204
end

