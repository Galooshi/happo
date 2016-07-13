module Happo
  module SnapshotComparisonImage
    # This subclass of `SnapshotComparisonImage` knows how to draw the
    # representation of the "after" image.
    class After < SnapshotComparisonImage::Base
      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_changed_row(y, row)
        render_added_row(y, row)
      end

      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_added_row(y, row)
        row.new_element.each_with_index do |pixel_after, x|
          render_pixel(x, y, pixel_after)
        end
      end
    end
  end
end
