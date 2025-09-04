class SearchResultsController < ApplicationController
  def index
    # Get search results with pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    
    search_results = SerpResult.order(ts: :desc)
                              .limit(per_page)
                              .offset((page - 1) * per_page)
    
    results_data = search_results.map do |result|
      {
        id: result.id.to_s,
        query: result.q,
        engine: result.engine,
        timestamp: result.ts.iso8601,
        organic_count: result.organic&.length || 0,
        ads_count: result.ads&.length || 0,
        paa_count: result.paa&.length || 0,
        related_count: result.related&.length || 0,
        organic_results: result.organic&.first(3) || [], # Show first 3 organic results
        related_queries: result.related&.first(5) || [], # Show first 5 related queries
        raw_snapshot_uri: result.raw_snapshot_uri,
        dom_signature: result.dom_signature
      }
    end
    
    render json: {
      search_results: results_data,
      pagination: {
        page: page,
        per_page: per_page,
        total: SerpResult.count,
        total_pages: (SerpResult.count.to_f / per_page).ceil
      }
    }
  end
end
