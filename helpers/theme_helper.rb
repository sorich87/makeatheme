module ThemeHelper

  # Return theme blocks and regions with Handlebars tags replaced
  def theme_pieces(theme)
    pieces = Hash[:blocks, [], :regions, [], :templates, []]

    locals = DefaultTemplates::CONTENT

    [:blocks, :regions, :templates].each do |type|
      theme.send(type).each do |piece|
        locals[piece[:name]] = piece[:build] = hbs(piece[:template], locals: locals)
        pieces[type] << piece
      end
    end

    pieces
  end

end
