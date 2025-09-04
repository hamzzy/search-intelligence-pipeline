class PlaywrightScraper
  def initialize(engine)
    @engine = engine
    @playwright = Playwright.create(playwright_cli_executable_path: 'npx playwright')
  end

  def fetch(query)
    @playwright.playwright.chromium.launch(headless: true) do |browser|
      page = browser.new_page
      
      case @engine
      when 'google'
        fetch_google_with_playwright(page, query)
      when 'bing'
        fetch_bing_with_playwright(page, query)
      when 'ddg'
        fetch_duckduckgo_with_playwright(page, query)
      else
        raise ArgumentError, "Unsupported engine: #{@engine}"
      end
    end
  end

  private

  def fetch_google_with_playwright(page, query)
    url = "https://www.google.com/search?q=#{CGI.escape(query)}"
    
    page.goto(url)
    page.wait_for_load_state('networkidle')
    
    # Handle CAPTCHA if present
    if page.locator('#captcha-form').visible?
      Rails.logger.warn "CAPTCHA detected for Google search: #{query}"
      return handle_captcha(page, query)
    end
    
    # Extract organic results
    organic = []
    page.locator('div.g').each_with_index do |result, index|
      title_elem = result.locator('h3').first
      link_elem = result.locator('a[href^="http"]').first
      snippet_elem = result.locator('.VwiC3b, .s3v9rd').first
      
      if title_elem.visible? && link_elem.visible?
        organic << {
          rank: index + 1,
          title: title_elem.text_content.strip,
          url: link_elem.get_attribute('href'),
          snippet: snippet_elem.visible? ? snippet_elem.text_content.strip : nil,
          rich_type: nil
        }
      end
    end

    # Extract PAA
    paa = []
    page.locator('.related-question-pair').each do |paa_elem|
      question = paa_elem.locator('.related-question-pair-text').first
      paa << question.text_content.strip if question.visible?
    end

    # Extract related searches
    related = []
    page.locator('.k8XOCe a').each do |related_elem|
      related << related_elem.text_content.strip
    end

    # Get page HTML for DOM signature
    html = page.content
    doc = Nokogiri::HTML(html)

    {
      organic: organic,
      ads: [], # TODO: Parse ads
      paa: paa,
      related: related,
      raw_html: html,
      dom_signature: compute_dom_signature(doc)
    }
  end

  def fetch_bing_with_playwright(page, query)
    # Placeholder for Bing scraping with Playwright
    {
      organic: [],
      ads: [],
      paa: [],
      related: [],
      raw_html: '',
      dom_signature: 'bing_playwright_placeholder'
    }
  end

  def fetch_duckduckgo_with_playwright(page, query)
    # Placeholder for DuckDuckGo scraping with Playwright
    {
      organic: [],
      ads: [],
      paa: [],
      related: [],
      raw_html: '',
      dom_signature: 'ddg_playwright_placeholder'
    }
  end

  def handle_captcha(page, query)
    Rails.logger.warn "CAPTCHA handling not implemented for query: #{query}"
    
    # Return empty results for now
    {
      organic: [],
      ads: [],
      paa: [],
      related: [],
      raw_html: page.content,
      dom_signature: 'captcha_detected'
    }
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
