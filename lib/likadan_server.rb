require 'sinatra/base'
require 'yaml'
require 'likadan_utils'

class LikadanServer < Sinatra::Base
  configure do
    enable :static
    set :port, LikadanUtils.config['port']
  end

  def current_diffs
    Dir.glob("#{LikadanUtils.config['snapshots_folder']}/**/diff.png")
  end

  get '/' do
    @config = LikadanUtils.config
    erb :index
  end

  get '/review' do
    @diffs = current_diffs
    erb :review
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
