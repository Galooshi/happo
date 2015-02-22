require 'sinatra/base'
require 'yaml'

def get_configuration
  config = {
    'source_files' => [],
    'stylesheets' => [],
    'port' => 4567
  }
  config_file = '.likadan.yaml'
  if File.exist? config_file
    config = config.merge(YAML.load_file(config_file))
  end
  config
end

class LikadanServer < Sinatra::Base
  configure do
    enable :static
    set :port, get_configuration['port']
  end

  get '/' do
    @config = get_configuration
    erb :index
  end

  get '/resource' do
    file = params[:file]
    if file.start_with? 'http'
      redirect file
    else
      send_file file
    end
  end

  run!
end
