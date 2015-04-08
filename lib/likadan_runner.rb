require 'selenium-webdriver'
require 'diffux_core/snapshot_comparer'
require 'diffux_core/snapshot_comparison_image/base'
require 'diffux_core/snapshot_comparison_image/gutter'
require 'diffux_core/snapshot_comparison_image/before'
require 'diffux_core/snapshot_comparison_image/overlayed'
require 'diffux_core/snapshot_comparison_image/after'
require 'chunky_png'
require 'likadan_utils'

driver = Selenium::WebDriver.for :firefox
begin
  driver.navigate.to 'http://localhost:4567/'

  while current = driver.execute_script('return window.likadan.next()') do
    current['viewportWidths'].each do |width|
      # Resize window to the right size before rendering
      driver.manage.window.resize_to(width, width)

      # Render the example
      rendered = driver.execute_script('return window.likadan.renderCurrent()')
      output_file = LikadanUtils.path_to(current['name'], width, 'candidate.png')

      # Create the folder structure if it doesn't already exist
      unless File.directory?(dirname = File.dirname(output_file))
        FileUtils.mkdir_p(dirname)
      end

      # Save and crop the screenshot
      driver.save_screenshot(output_file)
      cropped = ChunkyPNG::Image.from_file(output_file)
      cropped.crop!(0, 0, rendered['width'], rendered['height'])
      cropped.save(output_file)

      print "Checking \"#{current['name']}\" at #{width}px... "

      # Run the diff if needed
      baseline_file = LikadanUtils.path_to(current['name'], width, 'baseline.png')

      if File.exist? baseline_file
        comparison = Diffux::SnapshotComparer.new(
          ChunkyPNG::Image.from_file(baseline_file),
          cropped
        ).compare!

        if img = comparison[:diff_image]
          diff_output = LikadanUtils.path_to(current['name'], width, 'diff.png')
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
  end
ensure
  driver.quit
end
