require 'diffux_ci_utils'
require 'fileutils'

class DiffuxCIAction
  def initialize(example_description, viewport_name)
    @example_description = example_description
    @viewport_name = viewport_name
  end

  def approve
    diff_path = DiffuxCIUtils.path_to(@example_description, @viewport_name, 'diff.png')
    baseline_path = DiffuxCIUtils.path_to(@example_description, @viewport_name, 'baseline.png')
    candidate_path = DiffuxCIUtils.path_to(@example_description, @viewport_name, 'candidate.png')

    FileUtils.rm(diff_path, force: true)

    if File.exist? candidate_path
      FileUtils.mv(candidate_path, baseline_path)
    end
  end

  def reject
    diff_path = DiffuxCIUtils.path_to(@example_description, @viewport_name, 'diff.png')
    candidate_path = DiffuxCIUtils.path_to(@example_description, @viewport_name, 'candidate.png')

    FileUtils.rm(diff_path, force: true)
    FileUtils.rm(candidate_path, force: true)
  end
end
