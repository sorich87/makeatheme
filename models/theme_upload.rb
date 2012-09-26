class ThemeUpload
  include Mongoid::Document
  include Mongoid::Timestamps

  field :archive_id, type: String
  field :url, type: String
  belongs_to :author, :class_name => 'StoreUser'

  attr_accessor :archive
  validates_presence_of :archive, :nil => false

  before_save :save_to_gridfs
  before_destroy :delete_from_gridfs
  after_save :enqueue_processing!

  def archive
    return @archive unless persisted?
    return nil unless self.archive_id

    Mongoid::GridFS.get self.archive_id
  end

  private

  def delete_from_gridfs
    Mongoid::GridFS.delete(self.archive_id)
  end

  def save_to_gridfs
    result = Mongoid::GridFS.put self.archive
    if result.nil? or result.id.nil?
      return false
    else
      self.archive_id = result.id
    end
  end

  def enqueue_processing!
    Resque.enqueue(Jobs::ProcessTheme, self.id)
  end
end
