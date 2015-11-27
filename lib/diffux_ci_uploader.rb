require 'diffux_ci_utils'
require 's3'
require 'securerandom'

class DiffuxCIUploader
  def initialize
    @s3_access_key_id = DiffuxCIUtils.config['s3_access_key_id']
    @s3_secret_access_key = DiffuxCIUtils.config['s3_secret_access_key']
    @s3_bucket_name = DiffuxCIUtils.config['s3_bucket_name']
  end

  def upload_diffs
    current_snapshots = DiffuxCIUtils.current_snapshots
    return [] if current_snapshots[:diffs].empty?

    bucket = find_or_build_bucket

    dir = SecureRandom.uuid

    result_summary = YAML.load(File.read(File.join(
      DiffuxCIUtils.config['snapshots_folder'], 'result_summary.yaml')))
    diff_images = result_summary[:diff_examples].map do |diff|
      image = bucket.objects.build(
        "#{dir}/#{diff[:description]}_#{diff[:viewport]}.png")
      image.content = open(DiffuxCIUtils.path_to(diff[:description],
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
      image.content = open(DiffuxCIUtils.path_to(example[:description],
                                                 example[:viewport],
                                                 'baseline.png'))
      image.content_type = 'image/png'
      image.save
      example[:url] = image.url
      example
    end

    html = bucket.objects.build("#{dir}/index.html")
    path = File.expand_path(
      File.join(File.dirname(__FILE__), 'diffux_ci-diffs.html.erb'))
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
