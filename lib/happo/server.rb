require 'sinatra/base'
require 'yaml'

module Happo
  class Server < Sinatra::Base
    configure do
      enable :static
      set :port, Happo::Utils.config['port']
    end

    helpers do
      def h(text)
        Rack::Utils.escape_html(text)
      end
    end

    get '/' do
      @config = Happo::Utils.config
      erb :index
    end

    get '/debug' do
      @config = Happo::Utils.config
      erb :debug
    end

    get '/review' do
      result_summary = Happo::Utils.last_result_summary

      diff_images = result_summary[:diff_examples].map do |example|
        file_path = Happo::Utils.path_to(
          example[:description],
          example[:viewport],
          'diff.png'
        )
        example[:url] = "/resource?file=#{ERB::Util.url_encode(file_path)}"
        example
      end

      new_images = result_summary[:new_examples].map do |example|
        file_path = Happo::Utils.path_to(
          example[:description],
          example[:viewport],
          'current.png'
        )
        example[:url] = "/resource?file=#{ERB::Util.url_encode(file_path)}"
        example
      end
      erb :diffs, locals: {
        diff_images: diff_images,
        new_images: new_images
      }
    end

    get '/resource' do
      file = params[:file]
      if file.start_with? 'http'
        redirect file
      else
        send_file file
      end
    end

    get '/*' do
      # If this file is part of Happo itself (e.g. some bit of JavaScript), we
      # want to give that precedence so that Happo can work properly.
      file = params[:splat].first
      return send_file(file) if File.exist?(file)

      # The requested file is not part of Happo, so let's look in the configured
      # public directories. This is useful for serving up e.g. custom font files
      # that your components depend on to be rendered correctly.
      config = Happo::Utils.config
      config['public_directories'].each do |pub_dir|
        filepath = File.join(Dir.pwd, pub_dir, file)
        return send_file(filepath) if File.exist?(filepath)
      end

      status 404 # not found
      body '404 error: not found'
    end

    run!
  end
end
