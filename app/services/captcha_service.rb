class CaptchaService
  def initialize
    @api_key = ENV['CAPTCHA_API_KEY']
    @service = ENV['CAPTCHA_SERVICE'] || '2captcha'
    @enabled = ENV['ENABLE_CAPTCHA'] == 'true'
  end

  def solve_captcha(image_data, site_key: nil, page_url: nil)
    return nil unless @enabled && @api_key

    case @service
    when '2captcha'
      solve_with_2captcha(image_data, site_key, page_url)
    when 'anticaptcha'
      solve_with_anticaptcha(image_data, site_key, page_url)
    else
      Rails.logger.error "Unsupported CAPTCHA service: #{@service}"
      nil
    end
  rescue => e
    Rails.logger.error "CAPTCHA solving failed: #{e.message}"
    nil
  end

  def enabled?
    @enabled && @api_key.present?
  end

  private

  def solve_with_2captcha(image_data, site_key, page_url)
    # Submit CAPTCHA
    submit_response = HTTPX.post('http://2captcha.com/in.php', form: {
      key: @api_key,
      method: site_key ? 'hcaptcha' : 'base64',
      sitekey: site_key,
      pageurl: page_url,
      body: image_data
    })

    captcha_id = submit_response.body.to_s.split('|').last
    return nil unless captcha_id

    # Poll for result
    max_attempts = 30
    attempt = 0

    while attempt < max_attempts
      sleep(5)
      result_response = HTTPX.get("http://2captcha.com/res.php", params: {
        key: @api_key,
        action: 'get',
        id: captcha_id
      })

      result = result_response.body.to_s
      if result.start_with?('OK|')
        return result.split('|').last
      elsif result == 'CAPCHA_NOT_READY'
        attempt += 1
        next
      else
        Rails.logger.error "2Captcha error: #{result}"
        return nil
      end
    end

    Rails.logger.error "2Captcha timeout after #{max_attempts} attempts"
    nil
  end

  def solve_with_anticaptcha(image_data, site_key, page_url)
    # Similar implementation for AntiCaptcha
    # This is a placeholder
    Rails.logger.warn "AntiCaptcha integration not implemented"
    nil
  end
end
