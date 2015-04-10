require 'sinatra/base'
require 'yaml'
require 'likadan_utils'
require 'likadan_action'

class LikadanServer < Sinatra::Base
  configure do
    enable :static
    set :port, LikadanUtils.config['port']
  end

  def current_snapshots
    prepare_file = lambda do |file|
      width_dir = File.expand_path('..', file)
      name_dir = File.expand_path('..', width_dir)
      {
        name: File.basename(name_dir),
        width: File.basename(width_dir).sub('@', '').to_i,
        file: file,
      }
    end
    diff_files = Dir.glob("#{LikadanUtils.config['snapshots_folder']}/**/diff.png")
    baselines = Dir.glob("#{LikadanUtils.config['snapshots_folder']}/**/baseline.png")
    {
      diffs: diff_files.map(&prepare_file),
      baselines: baselines.map(&prepare_file)
    }
  end

  get '/' do
    @config = LikadanUtils.config
    erb :index
  end

  get '/review' do
    @snapshots = current_snapshots
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
    LikadanAction.new(params[:name], params[:width]).reject
    redirect back
  end

  post '/approve' do
    LikadanAction.new(params[:name], params[:width]).approve
    redirect back
  end

  run!
end
