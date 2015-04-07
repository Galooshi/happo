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
  viewport_widths = config['viewport_widths'] || [1024]

  if setup_commands = config['setup_commands']
    puts 'Running setup commands...'
    setup_commands.each do |setup_command|
      system setup_command
    end
  end

  driver.navigate.to 'http://localhost:4567/'

  viewport_widths.each do |viewport_width|
    driver.execute_script('window.likadan.reset()')
    driver.manage.window.resize_to(viewport_width, 800)

    while current = driver.execute_script('return window.likadan.next()') do
      normalized_name = current['name'].gsub(/[^a-zA-Z0-9\-_]/, '_')
      output_file = File.join(snapshots_folder, normalized_name,
                              "@#{viewport_width}", 'candidate.png')
      unless File.directory?(dirname = File.dirname(output_file))
        FileUtils.mkdir_p(dirname)
      end

      driver.save_screenshot(output_file)
      cropped = ChunkyPNG::Image.from_file(output_file)
      cropped.crop!(0, 0, current['width'], current['height'])
      cropped.save(output_file)

      print "Checking \"#{current['name']}\" at #{viewport_width}px... "

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

