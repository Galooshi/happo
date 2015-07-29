require 'sinatra/base'
require 'yaml'
require 'likadan_utils'
require 'likadan_action'

class LikadanServer < Sinatra::Base
  configure do
    enable :static
    set :port, LikadanUtils.config['port']
  end

  get '/' do
    @config = LikadanUtils.config
    erb :index
  end

  get '/review' do
    @snapshots = LikadanUtils.current_snapshots
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

  post '/reject' do
    LikadanAction.new(params[:name], params[:viewport]).reject
    redirect back
  end

  post '/approve' do
    LikadanAction.new(params[:name], params[:viewport]).approve
    redirect back
  end

  run!
end
