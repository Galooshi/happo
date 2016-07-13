require 'oily_png'
require 'diff-lcs'
require_relative 'diff_cluster_finder'
require_relative 'snapshot_comparison_image/base'
require_relative 'snapshot_comparison_image/gutter'
require_relative 'snapshot_comparison_image/before'
require_relative 'snapshot_comparison_image/overlayed'
require_relative 'snapshot_comparison_image/after'

module DiffuxCI
  # This class is responsible for comparing two Snapshots and generating a diff.
  class SnapshotComparer
    # @param png_before [ChunkyPNG::Image]
    # @param png_after  [ChunkyPNG::Image]
    def initialize(png_before, png_after)
      @png_after  = png_after
      @png_before = png_before
    end

    # @return [Hash]
    def compare!
      no_diff = {
        diff_in_percent: 0,
        diff_image: nil,
        diff_clusters: []
      }

      # If these images are totally identical, we don't need to do any more
      # work.
      return no_diff if @png_before == @png_after

      array_before = to_array_of_arrays(@png_before)
      array_after = to_array_of_arrays(@png_after)

      # If the arrays of arrays of colors are identical, we don't need to do any
      # more work. This might happen if some of the headers are different.
      return no_diff if array_before == array_after

      sdiff = Diff::LCS.sdiff(array_before, array_after)
      cluster_finder  = DiffuxCI::DiffClusterFinder.new(sdiff.size)
      sprite, all_comparisons = initialize_comparison_images(
        [@png_after.width, @png_before.width].max, sdiff.size)

      sdiff.each_with_index do |row, y|
        # each row is a Diff::LCS::ContextChange instance
        all_comparisons.each { |image| image.render_row(y, row) }
        cluster_finder.row_is_different(y) unless row.unchanged?
      end

      percent_changed = cluster_finder.percent_of_rows_different
      {
        diff_in_percent: percent_changed,
        diff_image:      (sprite if percent_changed > 0),
        diff_clusters:   cluster_finder.clusters,
      }
    end

    private

    # @param [ChunkyPNG::Image]
    # @return [Array<Array<Integer>>]
    def to_array_of_arrays(chunky_png)
      array_of_arrays = []
      chunky_png.height.times do |y|
        array_of_arrays << chunky_png.row(y)
      end
      array_of_arrays
    end

    # @param canvas [ChunkyPNG::Image] The output image to draw pixels on
    # @return [Array<SnapshotComparisonImage>]
    def initialize_comparison_images(width, height)
      gutter_width = DiffuxCI::SnapshotComparisonImage::Gutter::WIDTH
      total_width = (width * 3) + (gutter_width * 3)

      sprite = ChunkyPNG::Image.new(total_width, height)
      offset, comparison_images = 0, []
      comparison_images << DiffuxCI::SnapshotComparisonImage::Gutter.new(offset, sprite)
      offset += gutter_width
      comparison_images << DiffuxCI::SnapshotComparisonImage::Before.new(offset, sprite)
      offset += width
      comparison_images << DiffuxCI::SnapshotComparisonImage::Gutter.new(offset, sprite)
      offset += gutter_width
      comparison_images << DiffuxCI::SnapshotComparisonImage::Overlayed.new(offset, sprite)
      offset += width
      comparison_images << DiffuxCI::SnapshotComparisonImage::Gutter.new(offset, sprite)
      offset += gutter_width
      comparison_images << DiffuxCI::SnapshotComparisonImage::After.new(offset, sprite)

      [sprite, comparison_images]
    end
  end
end
