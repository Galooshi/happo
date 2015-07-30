ruby <<RUBY
  require 'headless'
  exit(Headless.ly { system('rspec') ? 0 : 1 })
RUBY
