class AutocompleteScraper
  def initialize(engine)
    @engine = engine
  end

  def fetch(query)
    case @engine
    when 'google'
      fetch_google_autocomplete(query)
    when 'bing'
      fetch_bing_autocomplete(query)
    when 'ddg'
      fetch_duckduckgo_autocomplete(query)
    else
      raise ArgumentError, "Unsupported engine: #{@engine}"
    end
  end

  private

  def fetch_google_autocomplete(query)
    # Try with retries at operation level
    max_retries = 3
    retry_delay = 1
    
    max_retries.times do |attempt|
      begin
        Rails.logger.info "Autocomplete attempt #{attempt + 1}/#{max_retries} for: #{query}"
        
        url = "https://www.google.com/complete/search?client=firefox&q=#{CGI.escape(query)}"
        
        response = HTTPX.get(url, headers: {
          'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept' => 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language' => 'en-US,en;q=0.9',
          'Referer' => 'https://www.google.com/'
        })
    
        if response.status == 200
          begin
            # Google returns JSONP format: window.google.ac.h(JSON_DATA)
            body = response.body.to_s
            Rails.logger.info "Google autocomplete response: #{body[0..200]}..."
            
            # Extract JSON from JSONP - try multiple patterns
            json_match = body.match(/window\.google\.ac\.h\((.+)\)/)
            if json_match
              json_data = json_match[1]
              suggestions = JSON.parse(json_data)
              Rails.logger.info "Parsed suggestions: #{suggestions.inspect}"
              return suggestions[1] || [] # Second element contains the suggestions
            end
            
            # Try direct JSON parsing if it's already JSON
            if body.start_with?('[')
              suggestions = JSON.parse(body)
              Rails.logger.info "Direct JSON suggestions: #{suggestions.inspect}"
              return suggestions[1] || []
            end
            
          rescue => e
            Rails.logger.error "JSON parsing failed: #{e.message}"
            Rails.logger.error "Response body: #{body[0..500]}"
          end
        else
          Rails.logger.error "Google autocomplete HTTP error: #{response.status}"
        end
        
        # If we get here, this attempt failed
        if attempt < max_retries - 1
          Rails.logger.info "Retrying in #{retry_delay} seconds..."
          sleep(retry_delay)
          retry_delay *= 2 # Exponential backoff
        end
        
      rescue => e
        Rails.logger.error "Autocomplete attempt #{attempt + 1} failed: #{e.message}"
        if attempt < max_retries - 1
          Rails.logger.info "Retrying in #{retry_delay} seconds..."
          sleep(retry_delay)
          retry_delay *= 2
        end
      end
    end
    
    Rails.logger.error "All autocomplete attempts failed for: #{query}"
    raise "All scraping methods failed for autocomplete: #{query}"
  rescue => e
    Rails.logger.error "Google autocomplete failed: #{e.message}"
    []
  end

  def fetch_bing_autocomplete(query)
    # Placeholder for Bing autocomplete
    []
  end

  def fetch_duckduckgo_autocomplete(query)
    # Placeholder for DuckDuckGo autocomplete
    []
  end
end
