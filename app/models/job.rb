class Job
  include Mongoid::Document
  include Mongoid::Timestamps

  field :job_id, type: String
  field :q, type: String
  field :engine, type: String
  field :status, type: String, default: 'queued'
  field :attempts, type: Integer, default: 0
  field :error, type: String

  index({ job_id: 1 }, { unique: true })
  index({ status: 1, created_at: 1 })

  validates :job_id, presence: true, uniqueness: true
  validates :q, presence: true
  validates :engine, presence: true
  validates :status, inclusion: { in: %w[queued running done failed] }

  def self.find_by_job_id(job_id)
    where(job_id: job_id).first
  end

  def running?
    status == 'running'
  end

  def done?
    status == 'done'
  end

  def failed?
    status == 'failed'
  end

  def queued?
    status == 'queued'
  end
end
