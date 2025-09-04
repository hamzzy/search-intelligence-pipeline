Rails.application.routes.draw do
  # API v1 routes
  scope :v1 do
    get 'search', to: 'search#show'
    get 'autocomplete', to: 'autocomplete#show'
    get 'related', to: 'related#show'
    get 'jobs', to: 'jobs#index'
    get 'jobs/:id', to: 'jobs#show'
    get 'selectors/alerts', to: 'selector_alerts#index'
    patch 'selectors/alerts/:id/ack', to: 'selector_alerts#acknowledge'
    patch 'selectors/alerts/:id/resolve', to: 'selector_alerts#resolve'
    get 'trends', to: 'trends#index'
    get 'search-results', to: 'search_results#index'
  end

  # Health and monitoring endpoints
  get 'healthz', to: 'health#live'
  get 'readyz', to: 'health#ready'
  get 'metrics', to: 'health#metrics'

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
