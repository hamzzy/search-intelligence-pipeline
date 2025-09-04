require 'rails_helper'

RSpec.describe SearchController, type: :controller do
  describe 'GET #show' do
    context 'with valid parameters' do
      let(:query) { 'test query' }
      let(:engine) { 'google' }

      context 'when cached result exists' do
        let!(:cached_result) do
          SerpResult.create!(
            engine: engine,
            q: query,
            ts: 30.minutes.ago,
            organic: [{ rank: 1, title: 'Test Result', url: 'http://example.com', snippet: 'Test snippet' }],
            ads: [],
            paa: [],
            related: []
          )
        end

        it 'returns cached result' do
          get :show, params: { q: query, engine: engine }
          
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['query']).to eq(query)
          expect(json_response['engine']).to eq(engine)
          expect(json_response['organic']).to be_present
        end
      end

      context 'when no cached result exists' do
        it 'enqueues a job and returns job_id' do
          expect(SearchJob).to receive(:perform_async).with(kind_of(String), query, engine)
          
          get :show, params: { q: query, engine: engine }
          
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['job_id']).to be_present
          expect(json_response['status']).to eq('queued')
        end
      end

      context 'when fresh=true' do
        let!(:cached_result) do
          SerpResult.create!(
            engine: engine,
            q: query,
            ts: 30.minutes.ago,
            organic: []
          )
        end

        it 'ignores cached result and enqueues job' do
          expect(SearchJob).to receive(:perform_async).with(kind_of(String), query, engine)
          
          get :show, params: { q: query, engine: engine, fresh: 'true' }
          
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['job_id']).to be_present
          expect(json_response['status']).to eq('queued')
        end
      end
    end

    context 'with invalid parameters' do
      it 'returns error when query is missing' do
        get :show, params: { engine: 'google' }
        
        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Query parameter q is required')
      end

      it 'uses default engine when not specified' do
        expect(SearchJob).to receive(:perform_async).with(kind_of(String), 'test query', 'google')
        
        get :show, params: { q: 'test query' }
        
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
