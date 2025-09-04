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
    url = "https://www.google.com/complete/search?client=firefox&q=#{CGI.escape(query)}"
    
    response = HTTPX.get(url, headers: {
      'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })
    
    if response.status == 200
      # Google returns JSONP, extract the JSON part
      json_data = response.body.to_s.match(/\[(.*)\]/)[1] rescue nil
      if json_data
        suggestions = JSON.parse("[#{json_data}]")
        return suggestions[1] || [] # Second element contains the suggestions
      end
    end
    
    []
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
