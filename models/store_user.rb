require 'bcrypt'

class StoreUser
  include Mongoid::Document
  include Mongoid::Timestamps

  field :first_name, :type => String
  field :last_name, :type => String
  field :email, :type => String
  field :password_hash, :type => String
  field :password_salt, :type => String

  attr_accessor :password

  validates_presence_of [:first_name, :last_name, :email], :nil => false
  validates_presence_of :password, :on => :create
  validates_uniqueness_of :email

  attr_protected :password_hash

  before_create :generate_password_hash

  def to_fullname
    "#{self.first_name self.last_name}"
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
      first_name: first_name,
      last_name: last_name,
      email: email,
      created_at: created_at,
      updated_at: updated_at
    }
  end

  private
  def generate_password_hash
    if password.present?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = BCrypt::Engine.hash_secret(password, password_salt)
    end
  end
end
