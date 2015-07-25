Gem::Specification.new do |s|
  s.name        = 'likadan'
  s.version     = '0.0.8'
  s.date        = '2015-02-20'
  s.summary     = 'Likadan'
  s.description = 'Likadan, a perceptual diff tool for JS components'
  s.authors     = ['Henric Trotzig']
  s.email       = 'henric.trotzig@gmail.com'
  s.executables = ['likadan']
  s.homepage    = 'http://rubygems.org/gems/likadan'
  s.license     = 'MIT'
  s.require_paths = ['lib']
  s.files         = Dir['lib/**/*']
  s.add_runtime_dependency 'diffux-core', '~> 0.0', '>= 0.0.2'
  s.add_runtime_dependency 'chunky_png', '~> 1.3', '>= 1.3.4'
  s.add_runtime_dependency 'selenium-webdriver', '~> 2.44', '>= 2.44.0'
  s.add_runtime_dependency 'thin', '~> 1.6', '>= 1.6.3'
  s.add_runtime_dependency 'sinatra', '~> 1.4', '>= 1.4.5'
  s.add_runtime_dependency 's3', '~> 0.3', '>= 0.3.22'
end
