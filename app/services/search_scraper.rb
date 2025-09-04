class SearchScraper
  def initialize(engine)
    @engine = engine
  end

  def fetch(query)
    case @engine
    when 'google'
      fetch_google(query)
    when 'bing'
      fetch_bing(query)
    when 'ddg'
      fetch_duckduckgo(query)
    else
      raise ArgumentError, "Unsupported engine: #{@engine}"
    end
  end

  private

  def fetch_google(query)
    url = "https://www.google.com/search?q=#{CGI.escape(query)}"
    
    begin
      # Use httpx for the request
      response = HTTPX.get(url, headers: {
        'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      })
      
      html = response.body.to_s
      doc = Nokogiri::HTML(html)
      
      # Check if we got blocked or got a CAPTCHA
      if html.include?('captcha') || html.include?('blocked') || response.status != 200
        Rails.logger.warn "HTTP request failed or blocked, falling back to Playwright"
        return fetch_with_playwright(query)
      end
    rescue => e
      Rails.logger.warn "HTTP request failed: #{e.message}, falling back to Playwright"
      return fetch_with_playwright(query)
    end
    
    # Parse organic results
    organic = []
    doc.css('div.g').each_with_index do |result, index|
      title_elem = result.at_css('h3')
      link_elem = result.at_css('a[href^="http"]')
      snippet_elem = result.at_css('.VwiC3b, .s3v9rd')
      
      if title_elem && link_elem
        organic << {
          rank: index + 1,
          title: title_elem.text.strip,
          url: link_elem['href'],
          snippet: snippet_elem&.text&.strip,
          rich_type: nil
        }
      end
    end

    # Parse PAA (People Also Ask)
    paa = []
    doc.css('.related-question-pair').each do |paa_elem|
      question = paa_elem.at_css('.related-question-pair-text')
      paa << question.text.strip if question
    end

    # Parse related searches
    related = []
    doc.css('.k8XOCe a').each do |related_elem|
      related << related_elem.text.strip
    end

    {
      organic: organic,
      ads: [], # TODO: Parse ads
      paa: paa,
      related: related,
      raw_html: html,
      dom_signature: compute_dom_signature(doc)
    }
  end

  def fetch_bing(query)
    # Placeholder for Bing scraping
    {
      organic: [],
      ads: [],
      paa: [],
      related: [],
      raw_html: '',
      dom_signature: 'bing_placeholder'
    }
  end

  def fetch_duckduckgo(query)
    # Placeholder for DuckDuckGo scraping
    {
      organic: [],
      ads: [],
      paa: [],
      related: [],
      raw_html: '',
      dom_signature: 'ddg_placeholder'
    }
  end

  def fetch_with_playwright(query)
    playwright_scraper = PlaywrightScraper.new(@engine)
    playwright_scraper.fetch(query)
  end

  def compute_dom_signature(doc)
    # Simple DOM signature based on key elements
    key_elements = []
    doc.css('div.g, .related-question-pair, .k8XOCe').each do |elem|
      key_elements << "#{elem.name}.#{elem['class']}"
    end
    Digest::SHA1.hexdigest(key_elements.join('|'))
  end
end
