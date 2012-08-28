module SessionHelper

  def require_auth!
    unless session?
      # Meh this is stupid.
      redirect "/login", 403
    end
  end

  def authenticate_user!(user)
    session_start!
    session[:user_id] = user.id
  end

  def current_user
    @current_user ||= StoreUser.find(session[:user_id]) if session[:user_id]
  end

end
