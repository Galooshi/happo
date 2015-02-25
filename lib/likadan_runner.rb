require 'selenium-webdriver'
require 'diffux_core/snapshot_comparer'
require 'diffux_core/snapshot_comparison_image/base'
require 'diffux_core/snapshot_comparison_image/gutter'
require 'diffux_core/snapshot_comparison_image/before'
require 'diffux_core/snapshot_comparison_image/overlayed'
require 'diffux_core/snapshot_comparison_image/after'
require 'chunky_png'
require 'yaml'

driver = Selenium::WebDriver.for :firefox
begin
  config = YAML.load_file('.likadan.yaml')
  snapshots_folder = config['snapshots_folder'] || './snapshots'

  driver.navigate.to 'http://localhost:4567/'

  while current = driver.execute_script('return window.likadan.next()') do
    normalized_name = current['name'].gsub(/[^a-zA-Z0-9\-_]/, '_')
    output_file = File.join(snapshots_folder, normalized_name, 'candidate.png')
    unless File.directory?(dirname = File.dirname(output_file))
      FileUtils.mkdir_p(dirname)
    end

    driver.save_screenshot(output_file)
    cropped = ChunkyPNG::Image.from_file(output_file)
    cropped.crop!(0, 0, current['width'], current['height'])
    cropped.save(output_file)

    print "Checking \"#{current['name']}\"... "

    baseline_file = File.join(snapshots_folder, normalized_name, 'baseline.png')
    if File.exist? baseline_file
      comparison = Diffux::SnapshotComparer.new(
        ChunkyPNG::Image.from_file(baseline_file),
        cropped
      ).compare!

      if img = comparison[:diff_image]
        diff_output = File.join(snapshots_folder, normalized_name, 'diff.png')
        img.save(diff_output)
        puts "#{comparison[:diff_in_percent]}% (#{diff_output})"
      else
        File.delete(output_file)
        puts 'No diff.'
      end
    else
      File.rename(output_file, baseline_file)
      puts "First snapshot created (#{baseline_file})"
    end
  end
ensure
  driver.quit
end

