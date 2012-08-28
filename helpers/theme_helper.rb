module ThemeHelper

  # Return theme blocks and regions with Handlebars tags replaced
  def theme_blocks_and_regions(theme)
    templates = Hash[:blocks, [], :regions, []]

    locals = DefaultTemplates::CONTENT

    theme.blocks.each do |block|
      block[:template] = hbs(block[:template], locals: locals)
      templates[:blocks] << block

      # Add to locals for regions replacement
      locals[block[:name]] = block[:template]
    end

    theme.regions.each do |region|
      region[:template] = hbs(region[:template], locals: locals)
      templates[:regions] << region
    end

    templates
  end

  # Return a theme template with Handlebars tags replaced
  def theme_template(theme, template)
    locals = DefaultTemplates::CONTENT

    blocks_and_regions = theme_blocks_and_regions(theme)

    blocks_and_regions[:blocks].each do |block|
      locals[block[:name]] = block[:template]
    end

    blocks_and_regions[:regions].each do |region|
      key = region[:type]
      key += region[:name] if region[:name]
      locals[key] = region[:template]
    end

    template = theme.template_content(template)
    hbs(template, locals: locals)
  end

end
