class SelectorVersion
  include Mongoid::Document
  include Mongoid::Timestamps

  field :engine, type: String
  field :version, type: Integer
  field :selectors, type: Hash, default: {}
  field :signature_examples, type: Array, default: []

  index({ engine: 1, version: -1 })

  validates :engine, presence: true
  validates :version, presence: true, numericality: { greater_than: 0 }
  validates :selectors, presence: true

  def self.current_for_engine(engine)
    where(engine: engine).order(version: :desc).first
  end

  def self.latest_version_for_engine(engine)
    where(engine: engine).max(:version) || 0
  end
end
