# OpenTelemetry configuration - disabled for now to avoid startup issues
# Uncomment and configure when needed for production

# begin
#   require 'opentelemetry/sdk'
#   require 'opentelemetry/exporter/otlp'
#   
#   OpenTelemetry::SDK.configure do |c|
#     c.service_name = 'search-intelligence-api'
#     c.service_version = '1.0.0'
#     
#     # Configure OTLP exporter
#     c.add_span_processor(
#       OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
#         OpenTelemetry::Exporter::OTLP::Exporter.new(
#           endpoint: ENV['OTEL_EXPORTER_OTLP_ENDPOINT'] || 'http://localhost:4318/v1/traces'
#         )
#       )
#     )
#   end
# rescue => e
#   Rails.logger.warn "OpenTelemetry configuration failed: #{e.message}"
# end
