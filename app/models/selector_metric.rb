class SelectorMetric
  include Mongoid::Document
  include Mongoid::Timestamps

  field :engine, type: String
  field :dom_signature, type: String
  field :total_attempts, type: Integer, default: 0
  field :successful_attempts, type: Integer, default: 0
  field :success_rate, type: Float, default: 0.0
  field :last_updated, type: Time

  index({ engine: 1, dom_signature: 1 }, { unique: true })
  index({ success_rate: 1 })

  validates :engine, presence: true
  validates :dom_signature, presence: true
  validates :success_rate, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }

  def self.find_or_create_by(attributes)
    where(attributes).first || create(attributes)
  end
end
