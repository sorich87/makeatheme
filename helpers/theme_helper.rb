module ThemeHelper

  # Return theme blocks and regions with Handlebars tags replaced
  def theme_pieces(theme, ensure_id = false)
    pieces = Hash[:blocks, [], :regions, [], :templates, []]

    locals = Defaults::HTML::CONTENT

    locals[:header_image_url] = theme.header_images.first.file.url

    xid = 0
    [:blocks, :regions, :templates].each do |type|
      theme.send(type).each do |piece|
        # Add id attribute to regions and templates without one, for use in the editor
        if ensure_id and type != :blocks
          template = Nokogiri::HTML::DocumentFragment.parse(piece[:template])
          template.css('.row, .columns, .column').each do |node|
            if node['id'].nil?
              node['id'] = "x-#{xid}"
              xid += 1
            end
          end
          piece[:template] = template.to_html
        end

        local_name = piece[:name]

        locals[local_name] = piece[:build] = liquid(piece[:template], locals: locals)

        pieces[type] << piece
      end
    end

    pieces
  end

end
