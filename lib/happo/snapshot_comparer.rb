require 'oily_png'
require 'diff-lcs'
require_relative 'snapshot_comparison_image/base'
require_relative 'snapshot_comparison_image/gutter'
require_relative 'snapshot_comparison_image/overlayed'

module Happo
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
      number_of_different_rows = 0

      sprite, all_comparisons = initialize_comparison_images(
        [@png_after.width, @png_before.width].max, sdiff.size
      )

      sdiff.each_with_index do |row, y|
        # each row is a Diff::LCS::ContextChange instance
        all_comparisons.each { |image| image.render_row(y, row) }
        number_of_different_rows += 1 unless row.unchanged?
      end

      percent_changed = number_of_different_rows.to_f / sdiff.size * 100
      {
        diff_in_percent: percent_changed,
        diff_image:      (sprite if percent_changed > 0.0),
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
      gutter_width = Happo::SnapshotComparisonImage::Gutter::WIDTH
      total_width = gutter_width + width

      sprite = ChunkyPNG::Image.new(total_width, height)
      offset, comparison_images = 0, []
      comparison_images << Happo::SnapshotComparisonImage::Gutter.new(offset, sprite)
      offset += gutter_width
      comparison_images << Happo::SnapshotComparisonImage::Overlayed.new(offset, sprite)
      [sprite, comparison_images]
    end
  end
end
