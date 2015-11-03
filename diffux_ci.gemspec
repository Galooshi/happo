require './lib/diffux_ci_version'

Gem::Specification.new do |s|
  s.name          = 'diffux_ci'
  s.version       = DiffuxCI::VERSION
  s.date          = '2015-11-03'
  s.summary       = 'Diffux-CI'
  s.description   = 'Diffux-CI, a perceptual diff tool for JS components'
  s.authors       = ['Henric Trotzig', 'Joe Lencioni']
  s.email         = ['henric.trotzig@gmail.com', 'joe.lencioni@gmail.com']
  s.executables   = ['diffux']
  s.homepage      = 'http://rubygems.org/gems/diffux_ci'
  s.license       = 'MIT'
  s.require_paths = ['lib']
  s.files         = Dir['lib/**/*']
  s.add_runtime_dependency 'diffux-core', '~> 0.0', '>= 0.0.2'
  s.add_runtime_dependency 'oily_png', '~> 1.1'
  s.add_runtime_dependency 'selenium-webdriver', '~> 2.44', '>= 2.44.0'
  s.add_runtime_dependency 'thin', '~> 1.6', '>= 1.6.3'
  s.add_runtime_dependency 'sinatra', '~> 1.4', '>= 1.4.5'
  s.add_runtime_dependency 's3', '~> 0.3', '>= 0.3.22'
end
