#!/usr/bin/env ruby
require 'headless'
exit(Headless.ly { system('rspec') ? 0 : 1 })
