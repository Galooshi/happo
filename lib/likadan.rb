require 'selenium-webdriver'
require 'diffux_core/snapshot_comparer'
require 'diffux_core/snapshot_comparison_image/base'
require 'diffux_core/snapshot_comparison_image/gutter'
require 'diffux_core/snapshot_comparison_image/before'
require 'diffux_core/snapshot_comparison_image/overlayed'
require 'diffux_core/snapshot_comparison_image/after'
require 'chunky_png'

driver = Selenium::WebDriver.for :firefox
driver.navigate.to 'http://localhost:4567/'

while current = driver.execute_script('return nextExample()') do
  now = Time.now.to_i
  file = "./screenshots/#{current['name']}/#{now}.png"
  dirname = File.dirname(file)
  unless File.directory?(dirname)
    FileUtils.mkdir_p(dirname)
  end

  previous_png = Dir.glob(File.join(dirname, '*.png')).max do |a,b|
    File.ctime(a) <=> File.ctime(b)
  end

  driver.save_screenshot(file)

  if previous_png
    puts "Comparing #{current['name']} with previous screenshot..."
    comparison = Diffux::SnapshotComparer.new(
      ChunkyPNG::Image.from_file(previous_png),
      ChunkyPNG::Image.from_file(file),
    ).compare!

    if img = comparison[:diff_image]
      img.save(file + '.diff.png')
      puts "DIFF: #{comparison[:diff_in_percent]}%"
    else
      puts 'No diff'
    end
  else
    puts "No previous image to compare #{current['name']} with."
  end
end

driver.quit

