class RelatedResult
  include Mongoid::Document
  include Mongoid::Timestamps

  field :engine, type: String
  field :q, type: String
  field :terms, type: Array, default: []
  field :ts, type: Time

  index({ q: 1, engine: 1, ts: -1 })
  index({ ts: 1 }, { expire_after_seconds: 1.day })

  validates :engine, presence: true
  validates :q, presence: true
  validates :ts, presence: true

  def self.find_recent(query, engine, max_age: 1.hour)
    where(q: query, engine: engine)
      .where(:ts.gte => max_age.ago)
      .order(ts: :desc)
      .first
  end
end
