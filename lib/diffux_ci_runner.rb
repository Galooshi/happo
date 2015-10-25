require 'selenium-webdriver'
require 'diffux_core/snapshot_comparer'
require 'diffux_core/snapshot_comparison_image/base'
require 'diffux_core/snapshot_comparison_image/gutter'
require 'diffux_core/snapshot_comparison_image/before'
require 'diffux_core/snapshot_comparison_image/overlayed'
require 'diffux_core/snapshot_comparison_image/after'
require 'oily_png'
require 'diffux_ci_utils'
require 'fileutils'

def resolve_viewports(example)
  configured_viewports = DiffuxCIUtils.config['viewports']

  viewports =
    example['options']['viewports'] || [configured_viewports.first.first]

  viewports.map do |viewport|
    configured_viewports[viewport].merge('name' => viewport)
  end
end

def init_driver
  tries = 0
  begin
    driver = Selenium::WebDriver.for DiffuxCIUtils.config['driver'].to_sym
  rescue Selenium::WebDriver::Error::WebDriverError => e
    # "unable to obtain stable firefox connection in 60 seconds"
    #
    # This seems to happen sporadically for some versions of Firefox, so we want
    # to retry a couple of times it in case it will work the second time around.
    tries += 1
    retry if tries <= 3
    raise e
  end

  driver.manage.timeouts.script_timeout = 3 # move to config?

  driver
end

driver = init_driver

begin
  driver.navigate.to DiffuxCIUtils.construct_url('/')

  # Check for errors during startup
  errors = driver.execute_script('return window.diffux.errors;')
  unless errors.empty?
    fail "JavaScript errors found during initialization: \n#{errors.inspect}"
  end

  all_examples = driver.execute_script('return window.diffux.getAllExamples()')

  all_examples.each do |example|
    description = example['description']

    resolve_viewports(example).each do |viewport|

      # Resize window to the right size before rendering
      driver.manage.window.resize_to(viewport['width'], viewport['height'])

      # Render the example

      # WebDriver's `execute_async_script` takes a string that is executed in
      # the context of a function. `execute_async_script` injects a callback
      # function as this function's argument here. WebDriver will wait until
      # this callback is called (if it is passed a value it will pass that
      # through to Rubyland), or until WebDriver's `script_timeout` is reached,
      # before continuing. Since we don't define the signature of this function,
      # we can't name the argument so we access it using JavaScript's magic
      # arguments object and pass it down to `renderExample()` which calls it
      # when it is done--either synchronously if our example doesn't take an
      # argument, or asynchronously via the Promise and `done` callback if it
      # does.
      script = <<-EOS
        var doneFunc = arguments[arguments.length - 1];
        window.diffux.renderExample(arguments[0], doneFunc);
      EOS
      rendered = driver.execute_async_script(script, description)

      if rendered['error']
        fail <<-EOS
          Error while rendering "#{description}" @#{viewport['name']}:
            #{rendered['error']}
          Debug by pointing your browser to
          #{DiffuxCIUtils.construct_url('/', description: description)}
        EOS
      end

      # Crop the screenshot to the size of the rendered element
      screenshot = ChunkyPNG::Image.from_blob(driver.screenshot_as(:png))

      # In our JavScript we are rounding up, which can sometimes give us a
      # dimensions that are larger than the screenshot dimensions. We need to
      # guard against that here.
      crop_width = [
        [rendered['width'], 1].max,
        screenshot.width - rendered['left']
      ].min
      crop_height = [
        [rendered['height'], 1].max,
        screenshot.height - rendered['top']
      ].min

      screenshot.crop!(rendered['left'],
                       rendered['top'],
                       crop_width,
                       crop_height)

      print "Checking \"#{description}\" at [#{viewport['name']}]... "

      # Run the diff if needed
      baseline_path = DiffuxCIUtils.path_to(
        description, viewport['name'], 'baseline.png')

      if File.exist? baseline_path
        # A baseline image exists, so we want to compare the new snapshot
        # against the baseline.
        comparison = Diffux::SnapshotComparer.new(
          ChunkyPNG::Image.from_file(baseline_path),
          screenshot
        ).compare!

        if comparison[:diff_image]
          # There was a visual difference between the new snapshot and the
          # baseline, so we want to write the diff image and the new snapshot
          # image to disk. This will allow it to be reviewed by someone.
          diff_path = DiffuxCIUtils.path_to(
            description, viewport['name'], 'diff.png')
          comparison[:diff_image].save(diff_path, :fast_rgba)

          candidate_path = DiffuxCIUtils.path_to(
            description, viewport['name'], 'candidate.png')
          screenshot.save(candidate_path, :fast_rgba)

          puts "#{comparison[:diff_in_percent].round(1)}% (#{candidate_path})"
        else
          # No visual difference was found, so we don't need to do any more
          # work.
          puts 'No diff.'
        end
      else
        # There was no baseline image yet, so we want to start by saving a new
        # baseline image.

        # Create the folder structure if it doesn't already exist
        unless File.directory?(dirname = File.dirname(baseline_path))
          FileUtils.mkdir_p(dirname)
        end
        screenshot.save(baseline_path, :fast_rgba)
        puts "First snapshot created (#{baseline_path})"
      end
    end
  end
ensure
  driver.quit
end
