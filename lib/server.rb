require 'sinatra'

configure do
  enable :static
end

get '/' do
  erb :index
end
