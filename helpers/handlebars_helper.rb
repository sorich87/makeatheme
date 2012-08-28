module HandlebarsHelper

  # Render handlebars template
  def hbs(*args)
    render(:hbs, *args)
  end

  # Mark a local to be returned as non escaped by handlebars
  def hbs_safe(local)
    proc { Handlebars::SafeString.new(local) }
  end

end
