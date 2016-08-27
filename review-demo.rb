#!/usr/bin/env ruby

# Add the lib directory to Ruby's load path so our requires will work.
$:.unshift(File.expand_path('./lib'))

require 'happo'

system 'open', Happo::Utils.construct_url('/review-demo')
require 'happo/server'
