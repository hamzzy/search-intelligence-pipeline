Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Json.new
  
  config.lograge.custom_options = lambda do |event|
    {
      time: Time.current.iso8601,
      request_id: event.payload[:headers]['action_dispatch.request_id'],
      user_id: event.payload[:user_id],
      remote_ip: event.payload[:remote_ip],
      user_agent: event.payload[:user_agent]
    }
  end
end
