require 's3'
require 'securerandom'

module Happo
  class Uploader
    def initialize
      @s3_access_key_id = ENV['S3_ACCESS_KEY_ID']
      @s3_secret_access_key = ENV['S3_SECRET_ACCESS_KEY']
      @s3_bucket_name = ENV['S3_BUCKET_NAME']
      @s3_bucket_path = ENV['S3_BUCKET_PATH']
    end

    def upload_diffs
      result_summary = YAML.load(File.read(File.join(
        Happo::Utils.config['snapshots_folder'], 'result_summary.yaml')))

      return [] if result_summary[:diff_examples].empty? &&
                   result_summary[:new_examples].empty?

      bucket = find_or_build_bucket
      dir = if @s3_bucket_path.nil? || @s3_bucket_path.empty?
              SecureRandom.uuid
            else
              File.join(@s3_bucket_path, SecureRandom.uuid)
            end

      diff_images = result_summary[:diff_examples].map do |diff|
        image = bucket.objects.build(
          "#{dir}/#{diff[:description]}_#{diff[:viewport]}.png")
        image.content = open(Happo::Utils.path_to(diff[:description],
                                                     diff[:viewport],
                                                     'diff.png'))
        image.content_type = 'image/png'
        image.save
        diff[:url] = image.url
        diff
      end

      new_images = result_summary[:new_examples].map do |example|
        image = bucket.objects.build(
          "#{dir}/#{example[:description]}_#{example[:viewport]}.png")
        image.content = open(Happo::Utils.path_to(example[:description],
                                                     example[:viewport],
                                                     'previous.png'))
        image.content_type = 'image/png'
        image.save
        example[:url] = image.url
        example
      end

      html = bucket.objects.build("#{dir}/index.html")
      path = File.expand_path(
        File.join(File.dirname(__FILE__), 'diffs.html.erb'))
      html.content = ERB.new(File.read(path)).result(binding)
      html.content_type = 'text/html'
      html.save
      html.url
    end

    private

    def find_or_build_bucket
      service = S3::Service.new(access_key_id: @s3_access_key_id,
                                secret_access_key: @s3_secret_access_key)
      bucket = service.buckets.find(@s3_bucket_name)

      if bucket.nil?
        bucket = service.buckets.build(@s3_bucket_name)
        bucket.save(location: :us)
      end

      bucket
    end
  end
end
