require 'yaml'
require 'erb'
require 'uri'
require 'base64'

module DiffuxCI
  class Utils
    def self.config
      @@config ||= {
        'snapshots_folder' => './snapshots',
        'source_files' => [],
        'stylesheets' => [],
        'port' => 4567,
        'driver' => :firefox,
        'viewports' => {
          'large' => {
            'width' => 1024,
            'height' => 768
          },
          'medium' => {
            'width' => 640,
            'height' => 888
          },
          'small' => {
            'width' => 320,
            'height' => 444
          }
        }
      }.merge(config_from_file)
    end

    def self.config_from_file
      config_file_name = ENV['DIFFUX_CI_CONFIG_FILE'] || '.diffux_ci.yaml'
      YAML.load(ERB.new(File.read(config_file_name)).result)
    end

    def self.normalize_description(description)
      Base64.encode64(description).strip
    end

    def self.path_to(description, viewport_name, file_name)
      File.join(
        config['snapshots_folder'],
        normalize_description(description),
        "@#{viewport_name}",
        file_name
      )
    end

    def self.construct_url(absolute_path, params = {})
      query = URI.encode_www_form(params) unless params.empty?

      URI::HTTP.build(host: 'localhost',
                      port: config['port'],
                      path: absolute_path,
                      query: query).to_s
    end

    def self.current_snapshots
      prepare_file = lambda do |file|
        viewport_dir = File.expand_path('..', file)
        description_dir = File.expand_path('..', viewport_dir)
        {
          description: Base64.decode64(File.basename(description_dir)),
          viewport: File.basename(viewport_dir).sub('@', ''),
          file: file
        }
      end

      snapshots_folder = DiffuxCI::Utils.config['snapshots_folder']
      diff_files = Dir.glob("#{snapshots_folder}/**/diff.png")
      baselines = Dir.glob("#{snapshots_folder}/**/baseline.png")

      {
        diffs: diff_files.map(&prepare_file),
        baselines: baselines.map(&prepare_file)
      }
    end
  end
end
