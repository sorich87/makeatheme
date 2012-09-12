require 'zip/zip'

module ThemeImport

  # TODO: Add validations & error handling
  def new_from_zip(zip_file, attributes = {})
    theme = self.new(attributes)

    begin
      import = Import.new(zip_file)

      theme.templates = import.templates
      theme.regions = import.regions

      if theme.valid?
        group = theme.build_theme_file_group

        import.static_files.each do |static_file|
          static_file = StaticThemeFile.new(
            :file_name => static_file[:filename],
            :file => static_file[:tempfile]
          )
          # Pass invalid files
          if static_file.valid?
            group.static_theme_files << static_file
            theme.static_theme_files << static_file
            static_file.save
          end
        end

        group.save
      end
    ensure
      import.static_files.each do |static_file|
        static_file[:tempfile].close
        File.unlink(static_file[:tempfile])
      end
    end

    theme
  end

  class Import
    def initialize(zip_file)
      @zip_file = zip_file
      @templates = []
      @regions = []
      @static_files = []

      Zip::ZipFile.foreach(zip_file) { |entry| parse_entry(entry) if entry.file? }

      fix_static_filenames
    end


    def parse_entry(zip_file)
      filename = File.basename(zip_file.to_s)

      if filename =~ /\A[\w-]+\.liquid\z/
        add_stored_file(zip_file)
      elsif filename =~ /\A[^\.]+/ # Ignore dotted files or __MACOSX files & such
        add_static_file(zip_file)
      end
    end

    def add_stored_file(entry)
      entry.get_input_stream do |html_file|
        template_name = File.basename(entry.to_s, '.*')
        file_content = html_file.read

        if template_name == "index"
          # themename/index.html
          # We want to ignore the themename/ later when
          # saving the static files
          @zip_folder = entry.to_s.split("index.liquid")[0]
        end

        if match = /\A(header|footer)(-)?(.*)/.match(template_name)
          if ['header', 'footer'].include?(template_name)
            region_slug = 'default'
          else
            region_slug = match[3]
          end

          @regions << {
            :slug => region_slug,
            :template => file_content,
            :name => get_region_name(template_name)
          }
        else
          @templates << {
            :name => template_name,
            :template => file_content
          }
        end
      end
    end

    def add_static_file(entry)
      filename = File.basename(entry.to_s)

      tempfile = File.open(File.join(Dir.mktmpdir, filename), 'w+')

      entry.get_input_stream do |entry_file|
        tempfile.write(entry_file.read)
        tempfile.rewind
      end

      @static_files << {
        :filename => entry.to_s,
        :tempfile => tempfile
      }
    end

    def regions
      @regions
    end

    def templates
      @templates
    end

    def static_files
      @static_files
    end

    def get_region_name(filename)
      match = /\A(header|footer)/.match(filename)
      match[1] if match
    end

    # Remove eg theme/ from theme/style.css,
    # but not theme/images/ from theme/images/logo.png
    def fix_static_filenames
      @static_files.each_with_index do |file, index|
        @static_files[index][:filename] = file[:filename].split(@zip_folder).last
      end
    end
  end
end
