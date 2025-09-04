class ProxyProvider
  def initialize
    @proxies = load_proxies_from_env
    @current_index = 0
  end

  def get_proxy
    return nil if @proxies.empty?
    
    proxy = @proxies[@current_index]
    @current_index = (@current_index + 1) % @proxies.length
    proxy
  end

  def get_random_proxy
    return nil if @proxies.empty?
    
    @proxies.sample
  end

  def proxy_count
    @proxies.length
  end

  def has_proxies?
    @proxies.any?
  end

  private

  def load_proxies_from_env
    proxy_list = ENV['PROXY_LIST'] || ''
    return [] if proxy_list.empty?
    
    proxy_list.split(',').map(&:strip).reject(&:empty?)
  end
end
