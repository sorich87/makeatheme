module SessionHelper
  def authenticate_user!(user)
    session_start!
    session[:user_id] = user.id
  end

  def current_user
    @current_user ||= StoreUser.find(session[:user_id]) if session[:user_id]
  end

  def forbid
    status 403
  end

  def authenticated?
    session?
  end
end
