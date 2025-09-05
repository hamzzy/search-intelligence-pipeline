source "https://rubygems.org"

ruby '3.3.0'

gem 'rails', '~> 8.0'
gem 'mongoid', '~> 9.0'
gem 'sidekiq'
gem 'redis'
gem 'httpx'
gem 'nokogiri'
gem 'playwright-ruby-client' # or 'ferrum', 'cuprite'
gem 'aws-sdk-s3' # for MinIO
gem 'sqlite3', '~> 1.4'

gem 'oj'
gem 'lograge'

# gem 'opentelemetry-sdk'
# gem 'opentelemetry-exporter-otlp'
# gem 'opentelemetry-instrumentation-all'
gem 'prometheus_exporter'

gem 'rspec-rails'
gem 'factory_bot_rails'
gem 'faker'

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ mswin mswin64 mingw x64_mingw jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Deploy this application anywhere as a Docker container [https://kamal-deploy.org]
gem "kamal", require: false

# Add HTTP asset caching/compression and X-Sendfile acceleration to Puma [https://github.com/basecamp/thruster/]
gem "thruster", require: false

# Use Rack CORS for handling Cross-Origin Resource Sharing (CORS), making cross-origin Ajax possible
gem "rack-cors"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri mswin mswin64 mingw x64_mingw ], require: "debug/prelude"

  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false

  # Omakase Ruby styling [https://github.com/rails/rubocop-rails-omakase/]
  gem "rubocop-rails-omakase", require: false
end