module SessionHelper
  def authenticate_user!(user)
    session_start!
    session[:user_id] = user.id
  end

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  def authenticated?
    !!current_user
  end

  def protect!
    halt 401 unless authenticated?
  end

  def admin_only!
    halt 401 unless authenticated? && current_user.is_admin?
  end

  def admin_or_owner_only!(user)
    halt 401 unless authenticated? &&
      (current_user.is_admin? || current_user.id == user.id)
  end
end

