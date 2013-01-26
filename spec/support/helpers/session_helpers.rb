module SessionHelpers
  def current_user
    User.where(email: current_user_attributes[:email]).first
  end

  def current_user_attributes
    attributes = {
      email: "current_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }

    unless User.where(email: attributes[:email]).first
      User.create(attributes)
    end

    attributes
  end

  def log_in!(user_attributes = nil)
    user_attributes = current_user_attributes if user_attributes.nil?
    post '/session', user_attributes.to_json
  end

  def admin_log_in!(user_attributes = nil)
    user = current_user
    user.admin = true
    user.save!
    log_in!(user_attributes)
  end

  def log_out!
    delete '/session'
  end
end
