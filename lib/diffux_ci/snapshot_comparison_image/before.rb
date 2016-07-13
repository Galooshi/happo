module DiffuxCI
  module SnapshotComparisonImage
    # This subclass of `SnapshotComparisonImage` knows how to draw the
    # representation of the "before" image.
    class Before < SnapshotComparisonImage::Base
      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_changed_row(y, row)
        render_deleted_row(y, row)
      end

      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_deleted_row(y, row)
        row.old_element.each_with_index do |pixel_before, x|
          render_pixel(x, y, pixel_before)
        end
      end
    end
  end
end
