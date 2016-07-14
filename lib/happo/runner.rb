require 'selenium-webdriver'
require 'oily_png'
require 'happo'
require 'fileutils'
require 'yaml'

def resolve_viewports(example)
  configured_viewports = Happo::Utils.config['viewports']

  viewports =
    example['options']['viewports'] || [configured_viewports.first.first]

  viewports.map do |viewport|
    configured_viewports[viewport].merge('name' => viewport)
  end
end

def init_driver
  tries = 0
  begin
    driver = Selenium::WebDriver.for Happo::Utils.config['driver'].to_sym
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

log = Happo::Logger.new(STDOUT)
driver = init_driver

begin
  driver.navigate.to Happo::Utils.construct_url('/')

  # Check for errors during startup
  errors = driver.execute_script('return window.happo.errors;')
  unless errors.empty?
    fail "JavaScript errors found during initialization: \n#{errors.inspect}"
  end

  # Initialize a hash to store a summary of the results from the run
  result_summary = {
    new_examples: [],
    diff_examples: [],
    okay_examples: []
  }

  all_examples = driver.execute_script('return window.happo.getAllExamples()')

  # To avoid the overhead of resizing the window all the time, we are going to
  # render all examples for each given viewport size all in one go.
  examples_by_viewport = {}

  all_examples.each do |example|
    viewports = resolve_viewports(example)

    viewports.each do |viewport|
      examples_by_viewport[viewport['name']] ||= {}
      examples_by_viewport[viewport['name']][:viewport] ||= viewport
      examples_by_viewport[viewport['name']][:examples] ||= []

      examples_by_viewport[viewport['name']][:examples] << example
    end
  end

  examples_by_viewport.each do |_, example_by_viewport|
    viewport = example_by_viewport[:viewport]
    examples = example_by_viewport[:examples]

    log.log "#{viewport['name']} (#{viewport['width']}x#{viewport['height']})"

    # Resize window to the right size before rendering
    driver.manage.window.resize_to(viewport['width'], viewport['height'])

    examples.each do |example|
      if example == examples.last
        log.log '└─ ', false
      else
        log.log '├─ ', false
      end
      description = example['description']
      log.log " #{description} ", false

      log.log '.', false

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
        window.happo.renderExample(arguments[0], doneFunc);
      EOS
      rendered = driver.execute_async_script(script, description)
      log.log '.', false

      if rendered['error']
        fail <<-EOS
          Error while rendering "#{description}" @#{viewport['name']}:
            #{rendered['error']}
          Debug by pointing your browser to
          #{Happo::Utils.construct_url('/', description: description)}
        EOS
      end

      # Crop the screenshot to the size of the rendered element
      screenshot = ChunkyPNG::Image.from_blob(driver.screenshot_as(:png))
      log.log '.', false

      # In our JavaScript we are rounding up, which can sometimes give us a
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

      if crop_width < screenshot.width || crop_height < screenshot.height
        screenshot.crop!(rendered['left'],
                         rendered['top'],
                         crop_width,
                         crop_height)
        log.log '.', false
      end

      # Run the diff if needed
      previous_image_path = Happo::Utils.path_to(
        description, viewport['name'], 'previous.png')

      if File.exist? previous_image_path
        # A previous image exists, so we want to compare the new snapshot
        # against the previous.
        comparison = Happo::SnapshotComparer.new(
          ChunkyPNG::Image.from_file(previous_image_path),
          screenshot
        ).compare!
        log.log '.', false

        if comparison[:diff_image]
          # There was a visual difference between the new snapshot and the
          # previous, so we want to write the diff image and the new snapshot
          # image to disk. This will allow it to be reviewed by someone.
          diff_path = Happo::Utils.path_to(
            description, viewport['name'], 'diff.png')
          comparison[:diff_image].save(diff_path, :fast_rgba)
          log.log '.', false

          current_image_path = Happo::Utils.path_to(
            description, viewport['name'], 'current.png')
          screenshot.save(current_image_path, :fast_rgba)
          log.log '.', false

          percent = comparison[:diff_in_percent].round(1)
          log.log log.cyan(" #{percent}% (#{current_image_path})")
          result_summary[:diff_examples] << {
            description: description,
            viewport: viewport['name']
          }
        else
          # No visual difference was found, so we don't need to do any more
          # work.
          log.log ' No diff.'
          result_summary[:okay_examples] << {
            description: description,
            viewport: viewport['name']
          }
        end
      else
        # There was no previous image yet, so we want to start by saving a new
        # previous image.

        # Create the folder structure if it doesn't already exist
        unless File.directory?(dirname = File.dirname(previous_image_path))
          FileUtils.mkdir_p(dirname)
        end
        screenshot.save(previous_image_path, :fast_rgba)
        log.log '.', false
        log.log " First snapshot created (#{previous_image_path})"
        result_summary[:new_examples] << {
          description: description,
          viewport: viewport['name']
        }
      end
    end
  end

  result_summary_file = File.join(Happo::Utils.config['snapshots_folder'],
                                  'result_summary.yaml')
  File.open(result_summary_file, 'w') do |file|
    file.write result_summary.to_yaml
  end
ensure
  driver.quit
end
