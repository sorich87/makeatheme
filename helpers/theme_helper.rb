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
    xid = 0

    # Register block tags
    Defaults::HTML::BLOCKS.map do |name, template|
      Liquid::Template.register_tag(name, LiquidTags::Block)
    end

    # Build blocks
    pieces[:blocks] = theme.blocks.collect do |block|
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

    # Build regions and templates
    [:regions, :templates].each do |type|
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
        end

        piece[:build] = liquid(piece[:template], locals: locals, scope: theme)
        piece[:build] = liquid(piece[:build], locals: locals, scope: theme)

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
    Resque.enqueue(Jobs::ThemeArchive, theme.id, url("/preview/#{theme.id}"))
  end
end
