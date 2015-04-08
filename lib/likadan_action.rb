require 'likadan_utils'
require 'FileUtils'

class LikadanAction
  def initialize(example_name, width)
    @example_name = example_name
    @width = width
  end

  def approve
    diff_path = LikadanUtils.path_to(@example_name, @width, 'diff.png')
    baseline_path = LikadanUtils.path_to(@example_name, @width, 'baseline.png')
    candidate_path = LikadanUtils.path_to(@example_name, @width, 'candidate.png')

    FileUtils.rm(diff_path, force: true)

    if File.exist? candidate_path
      FileUtils.mv(candidate_path, baseline_path)
    end
  end

  def reject
    diff_path = LikadanUtils.path_to(@example_name, @width, 'diff.png')
    candidate_path = LikadanUtils.path_to(@example_name, @width, 'candidate.png')

    FileUtils.rm(diff_path, force: true)
    FileUtils.rm(candidate_path, force: true)
  end
end
