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
    current['viewportWidths'].each do |viewport_width|
      # Resize window to the right size before rendering
      driver.manage.window.resize_to(viewport_width, viewport_width)

      # Render the example
      rendered = driver.execute_script('return window.likadan.renderCurrent()')
      output_file = File.join(snapshots_folder, normalized_name,
                              "@#{viewport_width}", 'candidate.png')

      # Create the folder structure if it doesn't already exist
      unless File.directory?(dirname = File.dirname(output_file))
        FileUtils.mkdir_p(dirname)
      end

      # Save and crop the screenshot
      driver.save_screenshot(output_file)
      cropped = ChunkyPNG::Image.from_file(output_file)
      cropped.crop!(0, 0, rendered['width'], rendered['height'])
      cropped.save(output_file)

      print "Checking \"#{current['name']}\" at #{viewport_width}px... "

      # Run the diff if needed
      baseline_file = File.join(snapshots_folder, normalized_name,
                                "@#{viewport_width}", 'baseline.png')
      if File.exist? baseline_file
        comparison = Diffux::SnapshotComparer.new(
          ChunkyPNG::Image.from_file(baseline_file),
          cropped
        ).compare!

        if img = comparison[:diff_image]
          diff_output = File.join(snapshots_folder, normalized_name,
                                "@#{viewport_width}", 'diff.png')
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
