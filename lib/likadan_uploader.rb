require 'likadan_utils'
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

    diff_images = current_snapshots[:diffs].map do |diff|
      image = bucket.objects.build("#{diff[:name]}_#{diff[:viewport]}.png")
      image.content = open(diff[:file])
      image.content_type = 'image/png'
      image.save
      diff[:url] = image.url
      diff
    end

    html = bucket.objects.build('likadan-diffs.html')
    html.content =
      ERB.new(
        File.read(File.expand_path(
          File.join(File.dirname(__FILE__), 'likadan-diffs.html.erb')))
      ).result(binding)
    html.content_type = 'text/html'
    html.save
    html.url
  end
end
