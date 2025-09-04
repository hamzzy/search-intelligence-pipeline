# Prometheus Exporter configuration - disabled to avoid connection errors
# Uncomment when Prometheus service is available

# begin
#   require 'prometheus_exporter/middleware'
#   
#   # Configure Prometheus Exporter for Docker environment
#   PrometheusExporter::Client.default = PrometheusExporter::Client.new(
#     host: ENV['PROMETHEUS_EXPORTER_HOST'] || 'prometheus',
#     port: ENV['PROMETHEUS_EXPORTER_PORT'] || 9394
#   )
#   
#   Rails.application.middleware.unshift PrometheusExporter::Middleware
# rescue => e
#   Rails.logger.warn "Prometheus Exporter configuration failed: #{e.message}"
# end
