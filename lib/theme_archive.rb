require 'zip/zip'

class ThemeArchive
  def initialize(theme)
    @theme = theme

    @base = {}
    @base.merge!(Defaults::PHP::CONTENT)

    @path = File.join(Dir.mktmpdir, "./#{@theme.path}.zip")

    create_zip
  end

  def create_zip
    if File.exists?(@path)
      File.delete(@path)
    end

    Zip::ZipFile.open(@path, Zip::ZipFile::CREATE) do |zipfile|
      compile_regions(zipfile)
      compile_templates(zipfile)
      compile_static_files(zipfile)
    end
  end

  def path
    @path
  end


  private

  def compile_templates(zipfile)
    @theme.templates.each do |template|
      zipfile.get_output_stream("#{template[:name]}.php") do |f|
        template = "<?php get_header(); ?>" + template[:template] + "<?php get_footer(); ?>"
        f.puts render_template(template, @base)
      end
    end
  end

  def compile_regions(zipfile)
    @theme.regions.each do |region|
      zipfile.get_output_stream(region.filename) do |f|
        template = region[:template]

        template = Defaults::PHP::REGIONS[:header] + template if 'header' == region[:name]
        template = template + Defaults::PHP::REGIONS[:footer] if 'footer' == region[:name]

        f.puts render_template(template, @base)
      end
    end
  end

  def compile_static_files(zipfile)
    @theme.needed_theme_files.each do |static_file|
      zipfile.get_output_stream(static_file.file_name) do |f|
        f.puts open(static_file.file.url).read
      end
    end
  end

  def render_template(template, locals)
    # Hash keys should be strings only
    locals = locals.inject({}){ |h,(k,v)| h[k.to_s] = v ; h }

    Liquid::Template.parse(template).render(locals)
  end
end
