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

  def generate_theme_archive(theme)
    Jobs::ThemeArchive.create(theme_id: theme.id)
  end

  # Load theme by id request parameter
  # 404 if not found
  def theme
    @theme ||= Theme.unscoped.find(params[:id])
    halt 404 unless @theme
    @theme
  end

  # Load editor template
  def respond_with_editor!
    preview_only = theme.preview_only?(current_user)

    pieces = theme_pieces(theme, !preview_only)

    index = pieces[:templates].select { |t| t[:name] == 'index' }[0]

    respond_with :editor,
      theme: theme.to_json,
      style: theme.style.to_json,
      pieces: pieces.to_json,
      static_files_dir: theme.static_files_dir,
      preview_only: preview_only,
      template: index[:full]
  end

  # Save or fork theme
  def respond_with_saved_theme!(theme, attrs, fork_theme = false)
    theme = theme.fork({
      :author => current_user
    }) if fork_theme

    theme.regions = attrs[:regions].map { |region| Region.new(region) }
    theme.templates = attrs[:templates].map { |template| Template.new(template) }
    theme.style = attrs[:style]

    if theme.save
      theme.archive_job_id = generate_theme_archive(theme)

      status 201
      respond_with theme
    else
      status 400
      respond_with theme.errors
    end
  end
end
