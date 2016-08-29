require 's3'
require 'securerandom'
require 'uri'

module Happo
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

      bucket = find_or_build_bucket
      dir = if @s3_bucket_path.nil? || @s3_bucket_path.empty?
              SecureRandom.uuid
            else
              File.join(@s3_bucket_path, SecureRandom.uuid)
            end

      diff_images = result_summary[:diff_examples].map do |diff|
        img_name = "#{diff[:description]}_#{diff[:viewport]}.png"
        image = bucket.objects.build("#{dir}/#{img_name}")
        image.content = open(Happo::Utils.path_to(diff[:description],
                                                     diff[:viewport],
                                                     'diff.png'))
        image.content_type = 'image/png'
        image.save
        diff[:url] = URI.escape(img_name)
        diff
      end

      new_images = result_summary[:new_examples].map do |example|
        img_name = "#{example[:description]}_#{example[:viewport]}.png"
        image = bucket.objects.build("#{dir}/#{img_name}")
        image.content = open(Happo::Utils.path_to(example[:description],
                                                     example[:viewport],
                                                     'current.png'))
        image.content_type = 'image/png'
        image.save
        example[:url] = URI.escape(img_name)
        example
      end

      html = bucket.objects.build("#{dir}/index.html")
      path = File.expand_path(
        File.join(File.dirname(__FILE__), 'views', 'diffs.erb'))
      html.content = ERB.new(File.read(path)).result(binding)
      html.content_encoding = 'utf-8'
      html.content_type = 'text/html'
      html.save
      html.url
    end

    private

    def find_or_build_bucket
      service = S3::Service.new(access_key_id: @s3_access_key_id,
                                secret_access_key: @s3_secret_access_key)
      bucket = service.bucket(@s3_bucket_name)
      bucket.save(location: :us) unless bucket.exists?
      bucket
    end
  end
end
