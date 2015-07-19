require 'likadan_utils'
require 'FileUtils'
require 's3'
require 'securerandom'

class LikadanUploader
  def initialize()
    @s3_access_key_id = LikadanUtils.config['s3_access_key_id']
    @s3_secret_access_key = LikadanUtils.config['s3_secret_access_key']
  end

  def upload_diffs
    service = S3::Service.new(access_key_id: @s3_access_key_id,
                              secret_access_key: @s3_secret_access_key)
    current_snapshots = LikadanUtils.current_snapshots
    return [] if current_snapshots[:diffs].empty?

    bucket = service.buckets.build(SecureRandom.hex)
    bucket.save(location: :us)

    current_snapshots[:diffs].map do |diff|
      object = bucket.objects.build("#{diff[:name]}_#{diff[:width]}.png")
      object.content = open(diff[:file])
      object.content_type = 'image/png'
      object.save
      object.url
    end
  end
end
