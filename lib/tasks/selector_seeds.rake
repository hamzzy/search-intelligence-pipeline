namespace :selector do
  desc "Seed selector-related data for development and testing"
  task seed: :environment do
    puts "🌱 Seeding selector data..."
    
    # Clear existing data in development/test
    if Rails.env.development? || Rails.env.test?
      puts "Clearing existing data..."
      SelectorAlert.delete_all
      SelectorMetric.delete_all
      SelectorVersion.delete_all
      SerpResult.delete_all
      Job.delete_all
    end

    # Create selector versions for different engines
    engines = ['google', 'bing', 'duckduckgo', 'yahoo']

    engines.each do |engine|
      # Create multiple versions for each engine
      (1..3).each do |version|
        SelectorVersion.find_or_create_by!(
          engine: engine,
          version: version
        ) do |sv|
          sv.selectors = {
            organic: version == 1 ? 'div.g' : version == 2 ? 'div[data-ved]' : 'div[jscontroller]',
            title: version == 1 ? 'h3' : version == 2 ? '.LC20lb' : '.DKV0Md',
            url: version == 1 ? 'a[href^="http"]' : version == 2 ? '.yuRUbf a' : '.yuRUbf a[href]',
            snippet: version == 1 ? '.VwiC3b' : version == 2 ? '.s3v9rd' : '.VwiC3b, .s3v9rd',
            position: version == 1 ? '.g' : version == 2 ? '[data-ved]' : '[jscontroller]'
          }
          sv.signature_examples = [
            "div.g[data-ved='#{SecureRandom.hex(8)}']",
            "div[jscontroller='#{SecureRandom.hex(12)}']",
            "div[data-hveid='#{SecureRandom.hex(10)}']"
          ]
        end
      end
    end

    puts "✅ Created selector versions for #{engines.length} engines"

    # Create sample selector metrics with various success rates
    dom_signatures = [
      'abc123def456',
      'xyz789uvw012',
      'mno345pqr678',
      'stu901vwx234',
      'ghi567jkl890'
    ]

    dom_signatures.each_with_index do |signature, index|
      engines.each do |engine|
        # Vary success rates to create realistic scenarios
        success_rate = case index
        when 0 then 0.95  # Very good
        when 1 then 0.75  # Moderate issues
        when 2 then 0.45  # Poor performance
        when 3 then 0.85  # Good
        when 4 then 0.60  # Needs attention
        end

        total_attempts = rand(50..500)
        successful_attempts = (total_attempts * success_rate).round

        SelectorMetric.find_or_create_by!(
          engine: engine,
          dom_signature: signature
        ) do |metric|
          metric.total_attempts = total_attempts
          metric.successful_attempts = successful_attempts
          metric.success_rate = success_rate
          metric.last_updated = rand(1..7).days.ago
        end
      end
    end

    puts "✅ Created selector metrics for #{dom_signatures.length} signatures across #{engines.length} engines"

    # Create sample selector alerts for low-performing selectors
    SelectorMetric.where(:success_rate.lt => 0.8).each do |metric|
      # Only create alerts for metrics that don't already have open alerts
      next if SelectorAlert.where(
        engine: metric.engine,
        dom_signature: metric.dom_signature,
        status: 'open'
      ).exists?

      break_rate = 1.0 - metric.success_rate
      
      # Generate suggested patches based on engine
      suggested_patch = case metric.engine
      when 'google'
        {
          organic: 'div.g, .g',
          title: 'h3, .LC20lb, .DKV0Md',
          url: 'a[href^="http"], .yuRUbf a',
          snippet: '.VwiC3b, .s3v9rd, .st'
        }
      when 'bing'
        {
          organic: '.b_algo, .b_result',
          title: 'h2 a, .b_title a',
          url: 'a[href^="http"]',
          snippet: '.b_caption p, .b_descript'
        }
      when 'duckduckgo'
        {
          organic: '.result, .web-result',
          title: '.result__title a',
          url: 'a[href^="http"]',
          snippet: '.result__snippet'
        }
      when 'yahoo'
        {
          organic: '.dd, .Sr',
          title: 'h3 a, .ac-algo a',
          url: 'a[href^="http"]',
          snippet: '.compText, .ac-algo'
        }
      else
        {
          organic: 'div.result',
          title: 'h3, h2',
          url: 'a[href^="http"]',
          snippet: '.snippet, .description'
        }
      end

      SelectorAlert.create!(
        engine: metric.engine,
        ts: rand(1..30).days.ago,
        dom_signature: metric.dom_signature,
        break_rate: break_rate,
        suggested_patch: suggested_patch,
        status: ['open', 'ack', 'resolved'].sample
      )
    end

    puts "✅ Created selector alerts for low-performing selectors"

    # Create some sample SERP results with different DOM signatures
    sample_queries = [
      'ruby programming language',
      'javascript frameworks 2024',
      'python web development',
      'react vs vue comparison',
      'node.js best practices',
      'rails vs django',
      'typescript tutorial',
      'web scraping techniques'
    ]

    sample_queries.each do |query|
      engines.each do |engine|
        dom_signature = dom_signatures.sample
        success = rand > 0.3  # 70% success rate
        
        SerpResult.create!(
          engine: engine,
          q: query,
          ts: rand(1..30).days.ago,
          dom_signature: dom_signature,
          organic: success ? [
            {
              title: "#{query} - Official Documentation",
              url: "https://example.com/#{query.gsub(' ', '-')}",
              snippet: "Learn about #{query} with comprehensive guides and examples."
            },
            {
              title: "#{query} Tutorial for Beginners",
              url: "https://tutorial.com/#{query.gsub(' ', '-')}",
              snippet: "Step-by-step tutorial covering #{query} fundamentals."
            },
            {
              title: "Best Practices for #{query}",
              url: "https://bestpractices.com/#{query.gsub(' ', '-')}",
              snippet: "Industry best practices and patterns for #{query} development."
            }
          ] : [], # Empty array for failed parsing
          raw_snapshot_uri: "https://storage.example.com/snapshots/#{query.gsub(' ', '-')}-#{engine}-#{Time.current.to_i}.html"
        )
      end
    end

    puts "✅ Created sample SERP results for #{sample_queries.length} queries across #{engines.length} engines"

    # Create some sample jobs
    (1..10).each do |i|
      query = sample_queries.sample
      engine = engines.sample
      status = ['queued', 'running', 'done', 'failed', 'exhausted'].sample
      
      Job.create!(
        job_id: "job_#{SecureRandom.hex(8)}",
        q: query,
        engine: engine,
        status: status,
        attempts: rand(0..3),
        error: status == 'failed' ? 'Connection timeout' : nil,
        started_at: rand(1..7).days.ago,
        completed_at: status == 'done' ? rand(0..6).days.ago : nil,
        duration: status == 'done' ? rand(1.0..30.0) : nil,
        result_count: status == 'done' ? rand(5..50) : 0
      )
    end

    puts "✅ Created sample jobs"

    puts ""
    puts "🎉 Selector seeding completed successfully!"
    puts "Summary:"
    puts "- #{SelectorVersion.count} selector versions"
    puts "- #{SelectorMetric.count} selector metrics"
    puts "- #{SelectorAlert.count} selector alerts"
    puts "- #{SerpResult.count} SERP results"
    puts "- #{Job.count} jobs"
  end

  desc "Clear all selector-related data"
  task clear: :environment do
    puts "🗑️  Clearing selector data..."
    
    SelectorAlert.delete_all
    SelectorMetric.delete_all
    SelectorVersion.delete_all
    SerpResult.delete_all
    Job.delete_all
    
    puts "✅ All selector data cleared"
  end
end
