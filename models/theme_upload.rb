class ThemeUpload
  include Mongoid::Document
  include Mongoid::Timestamps

  field :archive_id, type: String
  belongs_to :author, :class_name => 'StoreUser'

  attr_accessor :archive
  validates_presence_of :archive, :nil => false

  before_save :save_to_gridfs

  def archive
    return @archive unless persisted?
    return nil unless self.archive_id

    Mongoid::GridFS.get self.archive_id
  end

  private
  def save_to_gridfs
    result = Mongoid::GridFS.put self.archive
    if result.nil? or result.id.nil?
      return false
    else
      self.archive_id = result.id
    end
  end

  def enqueue_processing!
    Resque.enqueue(ProcessTheme, self.id, self.created_at)
  end
end
