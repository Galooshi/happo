require 'diffux_ci/utils'
require 'fileutils'

module DiffuxCI
  class Action
    def initialize(example_description, viewport_name)
      @example_description = example_description
      @viewport_name = viewport_name
    end

    def approve
      diff_path = DiffuxCI::Utils.path_to(
        @example_description, @viewport_name, 'diff.png')
      baseline_path = DiffuxCI::Utils.path_to(
        @example_description, @viewport_name, 'baseline.png')
      candidate_path = DiffuxCI::Utils.path_to(
        @example_description, @viewport_name, 'candidate.png')

      FileUtils.rm(diff_path, force: true)
      FileUtils.mv(candidate_path, baseline_path) if File.exist? candidate_path
    end

    def reject
      diff_path = DiffuxCI::Utils.path_to(
        @example_description, @viewport_name, 'diff.png')
      candidate_path = DiffuxCI::Utils.path_to(
        @example_description, @viewport_name, 'candidate.png')

      FileUtils.rm(diff_path, force: true)
      FileUtils.rm(candidate_path, force: true)
    end
  end
end
