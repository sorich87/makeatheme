module ThemeHelper

  # Return theme blocks and regions with Handlebars tags replaced
  def theme_pieces(theme)
    pieces = Hash[:blocks, [], :regions, [], :templates, []]

    locals = DefaultTemplates::CONTENT

    [:blocks, :regions, :templates].each do |type|
      theme.send(type).each do |piece|
        local_name = if type == :regions then piece[:type] else piece[:name] end

        locals[local_name] = piece[:build] = hbs(piece[:template], locals: locals)
        pieces[type] << piece
      end
    end

    pieces
  end

end
