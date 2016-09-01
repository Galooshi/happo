require './lib/happo/version'

Gem::Specification.new do |s|
  s.name          = 'happo'
  s.version       = Happo::VERSION
  s.summary       = 'Happo'
  s.description   = 'Happo, a perceptual diff tool for JS components'
  s.authors       = ['Henric Trotzig', 'Joe Lencioni']
  s.email         = ['henric.trotzig@gmail.com', 'joe.lencioni@gmail.com']
  s.executables   = ['happo']
  s.homepage      = 'http://rubygems.org/gems/happo'
  s.license       = 'MIT'
  s.require_paths = ['lib']
  s.files         = Dir['lib/**/*']

  s.add_runtime_dependency 'chunky_png', '1.3.6'
  s.add_runtime_dependency 'diff-lcs', '~> 1.2'
  s.add_runtime_dependency 'oily_png', '~> 1.2'
  s.add_runtime_dependency 's3', '~> 0.3', '>= 0.3.22'
  s.add_runtime_dependency 'selenium-webdriver', '~> 2.53', '>= 2.53.0'
  s.add_runtime_dependency 'sinatra', '~> 1.4', '>= 1.4.5'
  s.add_runtime_dependency 'thin', '~> 1.6', '>= 1.6.3'
end
