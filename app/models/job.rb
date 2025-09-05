class Job
  include Mongoid::Document
  include Mongoid::Timestamps

  field :job_id, type: String
  field :q, type: String
  field :engine, type: String
  field :status, type: String, default: 'queued'
  field :attempts, type: Integer, default: 0
  field :error, type: String
  field :started_at, type: Time
  field :completed_at, type: Time
  field :duration, type: Float
  field :result_count, type: Integer, default: 0

  index({ job_id: 1 }, { unique: true })
  index({ status: 1, created_at: 1 })
  index({ started_at: 1 })
  index({ completed_at: 1 })

  validates :job_id, presence: true, uniqueness: true
  validates :q, presence: true
  validates :engine, presence: true
  validates :status, inclusion: { in: %w[queued running done failed exhausted] }

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

  def exhausted?
    status == 'exhausted'
  end

  def running_time
    return nil unless started_at
    end_time = completed_at || Time.current
    end_time - started_at
  end

  def success?
    status == 'done'
  end

  def failed_or_exhausted?
    %w[failed exhausted].include?(status)
  end

  def retryable?
    %w[failed].include?(status) && attempts < 3
  end

  def self.stats
    {
      total: count,
      queued: where(status: 'queued').count,
      running: where(status: 'running').count,
      done: where(status: 'done').count,
      failed: where(status: 'failed').count,
      exhausted: where(status: 'exhausted').count,
      avg_duration: where(:duration.exists => true).avg(:duration)&.round(2),
      total_results: where(:result_count.exists => true).sum(:result_count)
    }
  end
end
