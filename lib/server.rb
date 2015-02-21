require 'sinatra'
require 'yaml'

configure do
  enable :static
end

get '/' do
  @config = {
    'source_files' => []
  }
  config_file = '.likadan.yaml'
  if File.exist? config_file
    @config = @config.merge(YAML.load_file(config_file))
  end
  erb :index
end

get '/script' do
  file = params[:file]
  send_file file
end
