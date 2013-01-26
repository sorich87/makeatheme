describe User do
  before do
    @user_attributes = {
      email: "test_user@example.com",
      password: "test_password",
      first_name: "Test",
      last_name: "User"
    }
    @user = User.create!(@user_attributes)
  end

  after do
    @user.destroy
  end

  it { should be_timestamped_document }

  it { should have_fields(:first_name, :last_name, :email, :password_hash, :password_salt).of_type(String) }
  it { should have_fields(:password_reset_token, :password_reset_hash, :password_reset_salt).of_type(String) }
  it { should have_fields(:password_reset_sent_at).of_type(Time) }

  it { should validate_presence_of(:first_name) }
  it { should validate_presence_of(:last_name) }
  it { should validate_presence_of(:email) }
  it { should validate_presence_of(:password).on(:create) }
  it { should validate_uniqueness_of(:email) }

  it { should have_many(:themes).as_inverse_of(:author) }

  it { should_not allow_mass_assignment_of(:password_hash) }
  it { should_not allow_mass_assignment_of(:password_salt) }
  it { should_not allow_mass_assignment_of(:password_reset_token) }
  it { should_not allow_mass_assignment_of(:password_reset_hash) }
  it { should_not allow_mass_assignment_of(:password_reset_salt) }
  it { should_not allow_mass_assignment_of(:password_reset_sent_at) }

  it 'should generate a password hash and salt' do
    @user.password_hash.should_not be_empty
    @user.password_salt.should_not be_empty
  end

  describe '.to_fullname' do
    it "should return the user's first and last names" do
      @user.to_fullname.should == "#{@user_attributes[:first_name]} #{@user_attributes[:last_name]}"
    end
  end

  describe '.is_admin?' do
    it 'should be false if the user is not an admin' do
      @user.is_admin?.should == false
    end

    it 'should be true if the user is an admin' do
      @user.admin = true
      @user.is_admin?.should == true
      @user.admin = false
    end
  end

  describe '.authenticate' do
    it 'should return the user if email and password are correct' do
      user = User.authenticate(@user_attributes[:email], @user_attributes[:password])
      user.id.should == @user.id
    end

    it 'should not return the user if email and password are not correct' do
      user = User.authenticate(@user_attributes[:email], 'incorrect')
      user.should be_nil
    end
  end

  describe '.has_password?' do
    it 'should be true for the correct password' do
      @user.has_password?(@user_attributes[:password]).should be_true
    end

    it 'should be false for an incorrect password' do
      @user.has_password?('reset_password').should be_false
    end
  end

  describe 'password reset' do
    before do
      @user.initiate_password_reset!('reset_password')
      @user.reset_password!
    end

    after do
      @user.initiate_password_reset!(@user_attributes[:password])
      @user.reset_password!
    end

    it 'should replace the old password' do
      @user.has_password?(@user_attributes[:password]).should be_false
    end

    it 'should set a new password' do
      @user.has_password?('reset_password').should be_true
    end
  end
end
