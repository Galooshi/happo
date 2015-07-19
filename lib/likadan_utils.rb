require 'yaml'
require 'erb'

class LikadanUtils
  def self.config
    @@config ||= {
      'snapshots_folder' => './snapshots',
      'source_files' => [],
      'stylesheets' => [],
      'port' => 4567
    }.merge(YAML.load(ERB.new(File.read('.likadan.yaml')).result))
  end

  def self.normalize_name(name)
    name.gsub(/[^a-zA-Z0-9\-_]/, '_')
  end

  def self.path_to(name, width, file_name)
    File.join(
      config['snapshots_folder'],
      normalize_name(name),
      "@#{width}",
      file_name
    )
  end

  def self.construct_url(absolute_path, params = {})
    params_str = params.map do |key, value|
      "#{key}=#{URI.escape(value)}"
    end.join('&')
    unless params_str.empty?
      params_str = "?#{params_str}"
    end

    return "http://localhost:#{config['port']}#{absolute_path}#{params_str}"
  end
end
