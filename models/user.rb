require 'bcrypt'
require 'active_support'

class User
  include Mongoid::Document
  include Mongoid::Timestamps

  field :first_name, :type => String
  field :last_name, :type => String
  field :email, :type => String
  field :password_hash, :type => String
  field :password_salt, :type => String
  field :password_reset_token, :type => String
  field :password_reset_hash, :type => String
  field :password_reset_salt, :type => String
  field :password_reset_sent_at, :type => Time

  attr_accessor :password

  validates_presence_of [:first_name, :last_name, :email], :nil => false
  validates_presence_of :password, :on => :create
  validates_uniqueness_of :email

  has_many :themes, :inverse_of => :author

  attr_protected :password_hash

  before_create :subscribe_to_newsletter
  before_save :generate_password_hash

  def to_fullname
    "#{self.first_name} #{self.last_name}"
  end

  def self.authenticate(email, password)
    user = where(:email => email).first
    if user && user.password_hash == BCrypt::Engine.hash_secret(password, user.password_salt)
      user
    else
      nil
    end
  end

  def as_json(options={})
    {
      id: self.id,
      first_name: self.first_name,
      last_name: self.last_name,
      email: self.email,
      created_at: self.created_at,
      updated_at: self.updated_at,
      themes: self.themes.unscoped.as_json
    }
  end

  def initiate_password_reset!(password)
    self.password_reset_token = SecureRandom.hex(40)
    self.password_reset_salt = BCrypt::Engine.generate_salt
    self.password_reset_hash = BCrypt::Engine.hash_secret(password, self.password_reset_salt)
    self.password_reset_sent_at = Time.now
    self.save
  end

  def reset_password!
    return false if self.password_reset_sent_at < Time.now - 3600

    self.password_salt = self.password_reset_salt
    self.password_hash = self.password_reset_hash
    self.password_reset_token = ''
    self.password_reset_salt = ''
    self.password_reset_hash = ''
    self.password_reset_sent_at = nil
    self.save
  end

  def verify_password!(suspect)
    suspect_hash = BCrypt::Engine.hash_secret(suspect, self.password_salt)
    return suspect_hash == self.password_hash
  end

  private

  def generate_password_hash
    if password.present?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = BCrypt::Engine.hash_secret(password, password_salt)
    end
  end

  def subscribe_to_newsletter
    Jobs::NewsletterSubscription.perform_async(self.id)
  end
end
