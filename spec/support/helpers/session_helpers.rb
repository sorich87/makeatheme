module SessionHelpers
  def current_user
    User.where(email: current_user_attributes[:email]).first
  end

  def current_user_attributes
    @attributes = {
      email: "current_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    unless User.where(email: @attributes[:email]).first
      User.create(@attributes)
    end

    @attributes
  end

  def log_in!
    post '/session', current_user_attributes.to_json
  end

  def log_out!
    delete '/session'
  end
end
