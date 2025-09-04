class SearchJob
  include Sidekiq::Job

  def perform(job_id, query, engine)
    job = Job.find_by_job_id(job_id)
    return unless job

    job.update!(status: 'running', attempts: job.attempts + 1)

    begin
      # Fetch the search results
      scraper = SearchScraper.new(engine)
      results = scraper.fetch(query)
      
      # Store raw HTML to MinIO
      query_hash = Digest::SHA1.hexdigest(query)
      storage_service = StorageService.new
      raw_snapshot_uri = storage_service.store_html(results[:raw_html], engine, query_hash)
      
      # Create or update SerpResult
      serp_result = SerpResult.create!(
        engine: engine,
        q: query,
        ts: Time.current,
        organic: results[:organic],
        ads: results[:ads],
        paa: results[:paa],
        related: results[:related],
        raw_snapshot_uri: raw_snapshot_uri,
        dom_signature: results[:dom_signature]
      )

      job.update!(status: 'done')
      
    rescue => e
      Rails.logger.error "SearchJob failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      job.update!(status: 'failed', error: e.message)
      raise e
    end
  end
end
