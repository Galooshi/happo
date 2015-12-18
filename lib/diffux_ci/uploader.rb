require 's3'
require 'securerandom'

module DiffuxCI
  class Uploader
    def initialize
      @s3_access_key_id = DiffuxCI::Utils.config['s3_access_key_id']
      @s3_secret_access_key = DiffuxCI::Utils.config['s3_secret_access_key']
      @s3_bucket_name = DiffuxCI::Utils.config['s3_bucket_name']
    end

    def upload_diffs
      result_summary = YAML.load(File.read(File.join(
        DiffuxCI::Utils.config['snapshots_folder'], 'result_summary.yaml')))

      return [] if result_summary[:diff_examples].empty? &&
                   result_summary[:new_examples].empty?

      bucket = find_or_build_bucket
      dir = SecureRandom.uuid

      diff_images = result_summary[:diff_examples].map do |diff|
        image = bucket.objects.build(
          "#{dir}/#{diff[:description]}_#{diff[:viewport]}.png")
        image.content = open(DiffuxCI::Utils.path_to(diff[:description],
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
        image.content = open(DiffuxCI::Utils.path_to(example[:description],
                                                     example[:viewport],
                                                     'baseline.png'))
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
