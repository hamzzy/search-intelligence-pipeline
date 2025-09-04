require 'rails_helper'

RSpec.describe SearchScraper do
  let(:scraper) { SearchScraper.new('google') }

  describe '#fetch' do
    context 'with unsupported engine' do
      it 'raises ArgumentError' do
        scraper = SearchScraper.new('unsupported')
        expect { scraper.fetch('test query') }.to raise_error(ArgumentError, 'Unsupported engine: unsupported')
      end
    end

    context 'with google engine' do
      let(:mock_response) { double('response', body: mock_html) }
      let(:mock_html) do
        <<~HTML
          <html>
            <body>
              <div class="g">
                <h3>Test Result</h3>
                <a href="http://example.com">Link</a>
                <div class="VwiC3b">Test snippet</div>
              </div>
              <div class="related-question-pair">
                <div class="related-question-pair-text">Test PAA</div>
              </div>
              <div class="k8XOCe">
                <a>Related search</a>
              </div>
            </body>
          </html>
        HTML
      end

      before do
        allow(HTTPX).to receive(:get).and_return(mock_response)
      end

      it 'fetches and parses google results' do
        result = scraper.fetch('test query')

        expect(result).to have_key(:organic)
        expect(result).to have_key(:ads)
        expect(result).to have_key(:paa)
        expect(result).to have_key(:related)
        expect(result).to have_key(:raw_html)
        expect(result).to have_key(:dom_signature)

        expect(result[:organic]).to be_an(Array)
        expect(result[:ads]).to be_an(Array)
        expect(result[:paa]).to be_an(Array)
        expect(result[:related]).to be_an(Array)
        expect(result[:raw_html]).to eq(mock_html)
        expect(result[:dom_signature]).to be_present
      end

      it 'parses organic results correctly' do
        result = scraper.fetch('test query')
        
        expect(result[:organic].first).to include(
          rank: 1,
          title: 'Test Result',
          url: 'http://example.com',
          snippet: 'Test snippet',
          rich_type: nil
        )
      end

      it 'parses PAA correctly' do
        result = scraper.fetch('test query')
        
        expect(result[:paa]).to include('Test PAA')
      end

      it 'parses related searches correctly' do
        result = scraper.fetch('test query')
        
        expect(result[:related]).to include('Related search')
      end
    end
  end
end
