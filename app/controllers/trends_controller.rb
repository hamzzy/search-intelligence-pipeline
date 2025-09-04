class TrendsController < ApplicationController
  def index
    # Get trending queries from the last 7 days
    time_range = params[:days]&.to_i || 7
    start_date = time_range.days.ago
    
    # Get trending queries by frequency
    trending_queries = SerpResult.where(:ts.gte => start_date)
                                .group_by(&:q)
                                .transform_values(&:count)
                                .sort_by { |_, count| -count }
                                .first(20)
                                .map { |query, count| { query: query, count: count } }
    
    # Get trending by engine
    trending_by_engine = SerpResult.where(:ts.gte => start_date)
                                  .group_by(&:engine)
                                  .transform_values(&:count)
                                  .map { |engine, count| { engine: engine, count: count } }
    
    # Get daily search volume
    daily_volume = SerpResult.where(:ts.gte => start_date)
                            .group_by { |result| result.ts.to_date }
                            .transform_values(&:count)
                            .map { |date, count| { date: date.strftime('%Y-%m-%d'), count: count } }
    
    # Get top related queries
    all_related = SerpResult.where(:ts.gte => start_date)
                           .pluck(:related)
                           .flatten
                           .compact
                           .group_by(&:itself)
                           .transform_values(&:count)
                           .sort_by { |_, count| -count }
                           .first(15)
                           .map { |query, count| { query: query, count: count } }
    
    # Get search success rate by engine
    engine_success_rates = {}
    %w[google bing duckduckgo].each do |engine|
      total_searches = SerpResult.where(engine: engine, :ts.gte => start_date).count
      successful_searches = SerpResult.where(engine: engine, :ts.gte => start_date)
                                     .where(:organic.exists => true)
                                     .count
      
      success_rate = total_searches > 0 ? (successful_searches.to_f / total_searches * 100).round(2) : 0
      engine_success_rates[engine] = {
        total_searches: total_searches,
        successful_searches: successful_searches,
        success_rate: success_rate
      }
    end
    
    render json: {
      trending_queries: trending_queries,
      trending_by_engine: trending_by_engine,
      daily_volume: daily_volume,
      top_related_queries: all_related,
      engine_success_rates: engine_success_rates,
      time_range_days: time_range,
      generated_at: Time.current.iso8601
    }
  end
end
