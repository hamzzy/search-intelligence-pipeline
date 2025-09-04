class SerpResult
  include Mongoid::Document
  include Mongoid::Timestamps

  field :engine, type: String
  field :q, type: String
  field :ts, type: Time
  field :organic, type: Array, default: []
  field :ads, type: Array, default: []
  field :paa, type: Array, default: []
  field :related, type: Array, default: []
  field :raw_snapshot_uri, type: String
  field :dom_signature, type: String

  index({ q: 1, engine: 1, ts: -1 })
  index({ ts: 1 }, { expire_after_seconds: 30.days })

  validates :engine, presence: true
  validates :q, presence: true
  validates :ts, presence: true

  def self.find_recent(query, engine, max_age: 1.hour)
    where(q: query, engine: engine)
      .where(:ts.gte => max_age.ago)
      .order(ts: :desc)
      .first
  end

  def fresh?
    ts > 1.hour.ago
  end
end
