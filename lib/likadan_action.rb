require 'likadan_utils'
require 'fileutils'

class LikadanAction
  def initialize(example_name, viewport_name)
    @example_name = example_name
    @viewport_name = viewport_name
  end

  def approve
    diff_path = LikadanUtils.path_to(@example_name, @viewport_name, 'diff.png')
    baseline_path = LikadanUtils.path_to(@example_name, @viewport_name, 'baseline.png')
    candidate_path = LikadanUtils.path_to(@example_name, @viewport_name, 'candidate.png')

    FileUtils.rm(diff_path, force: true)

    if File.exist? candidate_path
      FileUtils.mv(candidate_path, baseline_path)
    end
  end

  def reject
    diff_path = LikadanUtils.path_to(@example_name, @viewport_name, 'diff.png')
    candidate_path = LikadanUtils.path_to(@example_name, @viewport_name, 'candidate.png')

    FileUtils.rm(diff_path, force: true)
    FileUtils.rm(candidate_path, force: true)
  end
end
