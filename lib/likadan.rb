require 'selenium-webdriver'
require 'diffux_core/snapshot_comparer'
require 'diffux_core/snapshot_comparison_image/base'
require 'diffux_core/snapshot_comparison_image/gutter'
require 'diffux_core/snapshot_comparison_image/before'
require 'diffux_core/snapshot_comparison_image/overlayed'
require 'diffux_core/snapshot_comparison_image/after'
require 'chunky_png'

driver = Selenium::WebDriver.for :firefox

begin
  driver.navigate.to 'http://localhost:4567/'

  while current = driver.execute_script('return window.likadan.next()') do
    now = Time.now.to_i
    normalized_name = current['name'].gsub(/[^a-zA-Z0-9\-_]/, '_')
    file = "./snapshots/#{normalized_name}/snapshot_#{now}.png"
    dirname = File.dirname(file)
    unless File.directory?(dirname)
      FileUtils.mkdir_p(dirname)
    end

    previous_png = Dir.glob(File.join(dirname, 'snapshot_*.png')).max do |a,b|
      File.ctime(a) <=> File.ctime(b)
    end

    driver.save_screenshot(file)
    to_crop = ChunkyPNG::Image.from_file(file)
    to_crop.crop!(0, 0, current['width'], current['height'])
    to_crop.save(file)

    print "Checking \"#{current['name']}\"... "

    if previous_png
      comparison = Diffux::SnapshotComparer.new(
        ChunkyPNG::Image.from_file(previous_png),
        ChunkyPNG::Image.from_file(file),
      ).compare!

      if img = comparison[:diff_image]
        diff_output = File.join(dirname, "diff_#{now}.png")
        img.save(diff_output)
        puts "#{comparison[:diff_in_percent]}% (#{diff_output})"
      else
        puts 'No diff.'
      end
    else
      puts "First snapshot created (#{file})"
    end
  end
ensure
  driver.quit
end

