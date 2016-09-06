require 'sinatra/base'
require 'yaml'

module Happo
  class Server < Sinatra::Base
    configure do
      enable :static
      set :port, Happo::Utils.config['port']
      set :bind, Happo::Utils.config['bind'] || 'localhost'
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

      diff_images = result_summary[:diff_examples].map do |image|
        [:previous, :diff, :current].each do |variant|
          file_path = Happo::Utils.path_to(
            image[:description],
            image[:viewport],
            "#{variant}.png"
          )
          image[variant] = "/resource?file=#{ERB::Util.url_encode(file_path)}"
        end
        image
      end

      new_images = result_summary[:new_examples].map do |image|
        file_path = Happo::Utils.path_to(
          image[:description],
          image[:viewport],
          'current.png'
        )
        image[:current] = "/resource?file=#{ERB::Util.url_encode(file_path)}"
        image
      end

      erb :diffs, locals: {
        diff_images: diff_images,
        new_images: new_images
      }
    end

    get '/review-demo' do
      diff_images = [
        {
          description: '<First> with "test"',
          viewport: 'small',
          previous: 'http://placehold.it/350x150',
          diff: 'http://placehold.it/350x150',
          current: 'http://placehold.it/450x190',
        },
        {
          description: '<First> some other \'test\'',
          viewport: 'medium',
          previous: 'http://placehold.it/550x150',
          diff: 'http://placehold.it/550x150',
          current: 'http://placehold.it/450x110',
        },
        {
          description: '<First>',
          viewport: 'large',
          previous: 'http://placehold.it/850x150',
          diff: 'http://placehold.it/850x150',
          current: 'http://placehold.it/850x150',
        },
      ]

      new_images = [
        {
          description: '<New>',
          viewport: 'small',
          current: 'http://placehold.it/350x150',
        },
        {
          description: '<New>',
          viewport: 'medium',
          current: 'http://placehold.it/550x150',
        },
        {
          description: '<New>',
          viewport: 'large',
          current: 'http://placehold.it/850x150',
        },
        {
          description: '<SomethingElseNew>',
          viewport: 'small',
          current: 'http://placehold.it/350x150',
        },
      ]

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
