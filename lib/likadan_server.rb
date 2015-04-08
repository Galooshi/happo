require 'sinatra/base'
require 'yaml'
require 'likadan_utils'

class LikadanServer < Sinatra::Base
  configure do
    enable :static
    set :port, LikadanUtils.config['port']
  end

  get '/' do
    @config = LikadanUtils.config
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
