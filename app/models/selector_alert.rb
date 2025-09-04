class SelectorAlert
  include Mongoid::Document
  include Mongoid::Timestamps

  field :engine, type: String
  field :ts, type: Time
  field :dom_signature, type: String
  field :break_rate, type: Float
  field :suggested_patch, type: Hash
  field :status, type: String, default: 'open'

  index({ engine: 1, status: 1, ts: -1 })
  index({ dom_signature: 1 })

  validates :engine, presence: true
  validates :ts, presence: true
  validates :dom_signature, presence: true
  validates :break_rate, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }
  validates :status, inclusion: { in: %w[open ack resolved] }

  def self.open_alerts
    where(status: 'open')
  end

  def self.for_engine(engine)
    where(engine: engine)
  end

  def open?
    status == 'open'
  end

  def acknowledged?
    status == 'ack'
  end

  def resolved?
    status == 'resolved'
  end
end
