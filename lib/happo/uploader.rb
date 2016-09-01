require 's3'
require 'securerandom'
require 'uri'

module Happo
  # Handles uploading diffs (serialized html doc + images) to an Amazon S3
  # account.
  class Uploader
    def initialize
      @s3_access_key_id = ENV['S3_ACCESS_KEY_ID']
      @s3_secret_access_key = ENV['S3_SECRET_ACCESS_KEY']
      @s3_bucket_name = ENV['S3_BUCKET_NAME']
      @s3_bucket_path = ENV['S3_BUCKET_PATH']
    end

    def upload_diffs
      result_summary = Happo::Utils.last_result_summary

      return [] if result_summary[:diff_examples].empty? &&
                   result_summary[:new_examples].empty?

      diff_images = result_summary[:diff_examples].map do |image|
        image[:previous] = upload_image(image, 'previous')
        image[:diff] = upload_image(image, 'diff')
        image[:current] = upload_image(image, 'current')
        image
      end

      new_images = result_summary[:new_examples].map do |image|
        image[:current] = upload_image(image, 'current')
        image
      end

      html = build_object("#{directory}/index.html")
      path = File.expand_path(
        File.join(File.dirname(__FILE__), 'views', 'diffs.erb')
      )
      html.content = ERB.new(File.read(path)).result(binding)
      html.content_encoding = 'utf-8'
      html.content_type = 'text/html'
      html.save
      html.url
    end

    private

    def find_or_build_bucket
      @bucket ||= begin
        service = S3::Service.new(access_key_id: @s3_access_key_id,
                                  secret_access_key: @s3_secret_access_key)
        bucket = service.bucket(@s3_bucket_name)
        bucket.save(location: :us) unless bucket.exists?
        bucket
      end
    end

    def build_object(path)
      find_or_build_bucket.objects.build(path)
    end

    def directory
      if @s3_bucket_path.nil? || @s3_bucket_path.empty?
        SecureRandom.uuid
      else
        File.join(@s3_bucket_path, SecureRandom.uuid)
      end
    end

    def upload_image(image, variant)
      img_name = "#{image[:description]}_#{image[:viewport]}_#{variant}.png"
      s3_image = build_object("#{directory}/#{img_name}")
      s3_image.content = open(Happo::Utils.path_to(image[:description],
                                                   image[:viewport],
                                                   "#{variant}.png"))
      s3_image.content_type = 'image/png'
      s3_image.save
      URI.escape(img_name)
    end
  end
end
