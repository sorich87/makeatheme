module ThemeHelper

  # Return theme blocks and regions with Liquid tags replaced
  def theme_pieces(theme, ensure_id = false)
    pieces = Hash[:blocks, [], :regions, [], :templates, []]

    locals = Defaults::HTML::CONTENT

    unless theme.header_images.empty?
      locals[:header_image_url] = theme.header_images.first.file.url
    end

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

        # Build that will be displayed to users.
        piece[:build] = liquid(piece[:template], locals: locals)

        # Add data attribute to recognize regions in the build.
        if type == :blocks
          build = Nokogiri::HTML::DocumentFragment.parse(piece[:build])
          build.xpath('*[1]').each do |node|
            node['data-x-name'] = piece[:name]
            node['data-x-id'] = "Default"
          end
          piece[:build] = build.to_html
        end

        # Add the header and footer to the template.
        if type == :templates
          header = pieces[:regions].select { |r|
            r[:name] == 'header' && r[:slug] == piece.regions[:header]
          }[0]

          footer = pieces[:regions].select { |r|
            r[:name] == 'footer' && r[:slug] == piece.regions[:footer]
          }[0]

          piece[:full] = header[:build] + piece[:build] + footer[:build]
        end

        # Add build to locals for future replacements
        locals[piece[:name]] = piece[:build]

        pieces[type] << piece
      end
    end

    pieces
  end

  def generate_theme_screenshot(theme)
    Resque.enqueue(ThemeScreenshot, theme.id, url("/preview/#{theme.id}"))
  end
end
