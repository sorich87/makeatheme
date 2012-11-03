module ThemeHelper
  # Return all available blocks with Liquid tags replaced
  def all_blocks(theme)
    Defaults::HTML::BLOCKS.map do |name, template|
      {
        name: name.to_s,
        template: template,
        build: liquid(template, locals: Defaults::HTML::locals(theme))
      }
    end
  end

  # Return theme blocks and regions with Liquid tags replaced
  def theme_pieces(theme, ensure_id = false)
    pieces = Hash[:blocks, [], :regions, [], :templates, []]
    locals = Defaults::HTML.locals(theme)
    theme_context = LiquidTags::Helpers::ThemeContext.new(theme)
    xid = 0

    # Register block tags
    %w(header_image navigation search_form article sidebar).map do |name, template|
      Liquid::Template.register_tag(name, LiquidTags::Block)
    end

    # Build blocks
    pieces[:blocks] = theme.blocks.collect do |block|
      block = block.attributes.symbolize_keys
      block[:build] = liquid(block[:template], locals: locals)

      # Add data attributes to identify blocks, for use in the editor
      build = Nokogiri::HTML::DocumentFragment.parse(block[:build])
      build.xpath('*[1]').each do |node|
        node['data-x-name'] = block[:name]
        node['data-x-label'] = "Default"
      end
      block[:build] = build.to_html
      block
    end

    # Add build to theme context for replacement in templates
    theme_context.blocks = pieces[:blocks]

    # Build regions and templates
    [:blocks, :regions, :templates].each do |type|
      theme.send(type).each do |piece|
        # Ensure all columns and rows have IDs, for use in the editor
        if ensure_id
          template = Nokogiri::HTML::DocumentFragment.parse(piece[:template])
          template.css('.row, .columns, .column').each do |node|
            if node['id'].nil?
              node['id'] = "x-#{xid}"
              xid += 1
            end
          end
          piece[:template] = template.to_html

          # Put back the tags messed up by Nokogiri percent encoding.
          piece[:template].gsub!('%7B%7B%20', '{{ ')
          piece[:template].gsub!('%20%7D%7D', ' }}')
          piece[:template].gsub!('%7B%7B', '{{')
          piece[:template].gsub!('%7D%7D', '}}')
        end

        piece[:build] = liquid(piece[:template], locals: locals, scope: theme_context)

        pieces[type] << piece
      end
    end

    # Add header and footer to templates.
    pieces[:templates].collect! do |template|
      header = pieces[:regions].select { |r|
        r[:name] == 'header' && r[:slug] == template.regions[:header]
      }[0]

      footer = pieces[:regions].select { |r|
        r[:name] == 'footer' && r[:slug] == template.regions[:footer]
      }[0]

      template[:full] = header[:build] + template[:build] + footer[:build]
      template
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

    erb :editor, {layout: false},
      theme: theme.to_json,
      style: theme.style.to_json,
      pieces: pieces.to_json,
      blocks: all_blocks(theme).to_json,
      preview_only: preview_only
  end

  # Load preview template
  def respond_with_preview!
    pieces = theme_pieces(theme)
    index = pieces[:templates].select { |t| t[:name] == 'index' }[0]

    erb :preview, {layout: false},
      style: theme.css,
      template: index[:full]
  end

  # Save or fork theme
  def respond_with_saved_theme!(theme, attrs)
    theme.blocks = attrs[:blocks].map { |block| Block.new(block) }
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
