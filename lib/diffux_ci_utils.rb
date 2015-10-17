require 'yaml'
require 'erb'

class DiffuxCIUtils
  def self.config
    config_file_name = ENV['DIFFUX_CI_CONFIG_FILE'] || '.diffux_ci.yaml'
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
    }.merge(YAML.load(ERB.new(File.read(config_file_name)).result))
  end

  def self.normalize_description(description)
    description.gsub(/[^a-zA-Z0-9\-_]/, '_')
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
    params_str = params.map do |key, value|
      "#{key}=#{URI.escape(value)}"
    end.join('&')
    params_str = "?#{params_str}" unless params_str.empty?

    "http://localhost:#{config['port']}#{absolute_path}#{params_str}"
  end

  def self.current_snapshots
    prepare_file = lambda do |file|
      viewport_dir = File.expand_path('..', file)
      description_dir = File.expand_path('..', viewport_dir)
      {
        description: File.basename(description_dir),
        viewport: File.basename(viewport_dir).sub('@', ''),
        file: file
      }
    end
    snapshots_folder = DiffuxCIUtils.config['snapshots_folder']
    diff_files = Dir.glob("#{snapshots_folder}/**/diff.png")
    baselines = Dir.glob("#{snapshots_folder}/**/baseline.png")
    {
      diffs: diff_files.map(&prepare_file),
      baselines: baselines.map(&prepare_file)
    }
  end
end
