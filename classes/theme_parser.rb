require 'zip/zip'

class ThemeParser
  @@templates = ['index.html', 'page.html']

  def self.parse(zip_file)
    ThemeParser.new(zip_file)
  end

  def initialize(zip_file)
    @zip_file = zip_file
    @stored_files = {
      :templates => [],
      :regions => []
    }

    @static_files = []

    Zip::ZipFile.foreach(zip_file) { |entry| parse_entry(entry) if entry.file? }
  end


  def parse_entry(zip_file)
    filename = zip_file.to_s
    if filename =~ /.html\z/
      add_stored_file(zip_file)
    elsif filename =~ /.css\z/
      #add_css_file(zip_file)
    else
      add_static_file(zip_file)
    end
  end

  def add_stored_file(entry)
    entry.get_input_stream do |html_file|
      filename = File.basename(entry.to_s)
      template_name = File.basename(entry.to_s, '.*')
      file_content = html_file.read

      if @@templates.include?(filename)
        @stored_files[:templates] << {
          :filename => template_name,
          :template => file_content
        }
        puts "Added #{filename} to @stored_files[:templates]"
      else
        @stored_files[:regions] << {
          :id => template_name,
          :filename => template_name,
          :template => file_content
        }
        puts "Added #{filename} to @stored_files[:regions]"
      end
    end
  end

  def add_static_file(entry)
    filename = File.basename(entry.to_s)
    tempfile = Tempfile.new(filename)

    entry.get_input_stream do |entry_file|
      tempfile.write(entry_file.read)
      tempfile.rewind
    end

    @static_files << {
      :filename => filename,
      :tempfile => tempfile
    }
  end

  def stored_files
    @stored_files[:templates] + @stored_files[:regions]
  end

  def static_files
    @static_files
  end
end