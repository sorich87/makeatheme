module ThemeHelper

  # Return theme blocks and regions with Handlebars tags replaced
  def theme_pieces(theme, ensure_id = false)
    pieces = Hash[:blocks, [], :regions, [], :templates, []]

    locals = DefaultTemplates::CONTENT

    xid = 0
    [:blocks, :regions, :templates].each do |type|
      theme.send(type).each do |piece|
        local_name = if type == :regions then piece[:type] else piece[:name] end

        if ensure_id
          # Add id attribute to elements without one, for use in the editor
          template = Nokogiri::HTML(piece[:template])
          template.css('.row, .columns, .column').each do |node|
            if node['id'].nil?
              node['id'] = "x-#{xid}"
              xid += 1
            end
          end
          piece[:template] = template.to_html
        end

        build = hbs(piece[:template], locals: locals)
        locals[local_name] = piece[:build] = hbs(piece[:template], locals: locals)

        pieces[type] << piece
      end
    end

    pieces
  end

  def theme_ensure_id_attribute(html)

  end

end
