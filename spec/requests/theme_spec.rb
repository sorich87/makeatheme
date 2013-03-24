require 'json'

describe :theme do
  describe :customization do
    before do
      @theme_attributes = {
        name: "Some theme",
        author: current_user,
        description: "Some theme."
      }

      zip = File.join('.', 'spec', 'fixtures', 'basic_valid_theme.zip')
      @theme = Theme.new_from_zip(zip, @theme_attributes)
      @theme.save!

      @json = File.read(File.join('.', 'spec', 'fixtures', 'theme_request.json'))
    end

    after do
      @theme.destroy
    end

    it 'should require authentication' do
      put "/themes/#{@theme.id}", @json
      last_response.status.should == 401
    end

    describe "as an authenticated user" do
      before do
        Kernel.stub!(:open)

        log_in!
        put "/themes/#{@theme.id}", @json
        @theme.reload
      end

      it 'should be successful' do
        last_response.status.should == 200
      end
    end
  end
end

