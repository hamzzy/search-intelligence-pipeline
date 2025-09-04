class StorageService
  def initialize
    @s3_client = Aws::S3::Client.new(
      endpoint: ENV['MINIO_ENDPOINT'] || 'http://localhost:9000',
      access_key_id: ENV['MINIO_ACCESS_KEY'] || 'minioadmin',
      secret_access_key: ENV['MINIO_SECRET_KEY'] || 'minioadmin',
      region: 'us-east-1',
      force_path_style: true
    )
    @bucket_name = 'search-snapshots'
  end

  def store_html(html_content, engine, query_hash)
    ensure_bucket_exists
    
    key = "snapshots/#{engine}/#{query_hash}/index.html"
    
    @s3_client.put_object(
      bucket: @bucket_name,
      key: key,
      body: html_content,
      content_type: 'text/html'
    )
    
    "s3://#{@bucket_name}/#{key}"
  rescue => e
    Rails.logger.error "Failed to store HTML: #{e.message}"
    nil
  end

  def get_html_url(engine, query_hash)
    key = "snapshots/#{engine}/#{query_hash}/index.html"
    "s3://#{@bucket_name}/#{key}"
  end

  def get_presigned_url(engine, query_hash, expires_in: 3600)
    key = "snapshots/#{engine}/#{query_hash}/index.html"
    
    @s3_client.get_object(
      bucket: @bucket_name,
      key: key
    )
    
    # Generate presigned URL for viewing
    signer = Aws::S3::Presigner.new(client: @s3_client)
    signer.presigned_url(:get_object, bucket: @bucket_name, key: key, expires_in: expires_in)
  rescue => e
    Rails.logger.error "Failed to generate presigned URL: #{e.message}"
    nil
  end

  private

  def ensure_bucket_exists
    @s3_client.create_bucket(bucket: @bucket_name) unless bucket_exists?
  rescue => e
    Rails.logger.error "Failed to create bucket: #{e.message}"
  end

  def bucket_exists?
    @s3_client.head_bucket(bucket: @bucket_name)
    true
  rescue Aws::S3::Errors::NotFound
    false
  end
end
