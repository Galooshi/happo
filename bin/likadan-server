require 'sinatra'
require 'yaml'

configure do
  enable :static
end

get '/' do
  @config = {
    'source_files' => [],
    'stylesheets' => []
  }
  config_file = '.likadan.yaml'
  if File.exist? config_file
    @config = @config.merge(YAML.load_file(config_file))
  end
  erb :index
end

get '/resource' do
  file = params[:file]
  send_file file
end
