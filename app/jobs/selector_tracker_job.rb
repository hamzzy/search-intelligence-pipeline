class SelectorTrackerJob
  include Sidekiq::Job

  def perform
    # Analyze parse success rates by DOM signature
    analyze_parse_success_rates
    
    # Generate alerts for high break rates
    generate_selector_alerts
  end

  private

  def analyze_parse_success_rates
    # Group results by engine and dom_signature
    results_by_signature = SerpResult.collection.aggregate([
      {
        '$group' => {
          '_id' => { 'engine' => '$engine', 'dom_signature' => '$dom_signature' },
          'total_count' => { '$sum' => 1 },
          'successful_count' => {
            '$sum' => {
              '$cond' => [
                { '$gt' => [{ '$size' => '$organic' }, 0] },
                1,
                0
              ]
            }
          },
          'latest_ts' => { '$max' => '$ts' }
        }
      },
      {
        '$match' => {
          'latest_ts' => { '$gte' => 1.day.ago }
        }
      }
    ])

    results_by_signature.each do |result|
      engine = result['_id']['engine']
      dom_signature = result['_id']['dom_signature']
      total_count = result['total_count']
      successful_count = result['successful_count']
      success_rate = successful_count.to_f / total_count

      # Store or update selector metrics
      SelectorMetric.find_or_create_by(
        engine: engine,
        dom_signature: dom_signature
      ).update!(
        total_attempts: total_count,
        successful_attempts: successful_count,
        success_rate: success_rate,
        last_updated: Time.current
      )
    end
  end

  def generate_selector_alerts
    # Find signatures with low success rates
    SelectorMetric.where(:success_rate.lt => 0.8).each do |metric|
      # Check if alert already exists
      existing_alert = SelectorAlert.where(
        engine: metric.engine,
        dom_signature: metric.dom_signature,
        status: 'open'
      ).first

      next if existing_alert

      # Generate suggested patch
      suggested_patch = generate_suggested_patch(metric.engine, metric.dom_signature)

      # Create alert
      SelectorAlert.create!(
        engine: metric.engine,
        ts: Time.current,
        dom_signature: metric.dom_signature,
        break_rate: 1.0 - metric.success_rate,
        suggested_patch: suggested_patch,
        status: 'open'
      )
    end
  end

  def generate_suggested_patch(engine, dom_signature)
    # Get recent failed results for this signature
    failed_results = SerpResult.where(
      engine: engine,
      dom_signature: dom_signature,
      :organic.size => 0
    ).limit(5)

    return {} if failed_results.empty?

    # Analyze the HTML structure and suggest new selectors
    suggested_selectors = {}
    
    failed_results.each do |result|
      # This would analyze the raw HTML and suggest new selectors
      # For now, return a placeholder
      suggested_selectors = {
        organic: 'div.g, .g',
        title: 'h3, .LC20lb',
        url: 'a[href^="http"]',
        snippet: '.VwiC3b, .s3v9rd, .st'
      }
    end

    suggested_selectors
  end
end
