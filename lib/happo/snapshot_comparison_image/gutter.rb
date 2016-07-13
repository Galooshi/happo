module Happo
  module SnapshotComparisonImage
    # This class renders a gutter-column with a color representing the type of
    # change that has happened.
    class Gutter < SnapshotComparisonImage::Base
      WIDTH = 10
      GRAY  = ChunkyPNG::Color.from_hex '#cccccc'

      def render_row(y, row)
        WIDTH.times do |x|
          render_pixel(x, y, gutter_color(row))
        end
        # render a two-pixel empty column
        2.times do |x|
          render_pixel(WIDTH - 1 - x, y, WHITE)
        end
      end

      private

      def gutter_color(row)
        if row.unchanged?
          WHITE
        elsif row.deleting?
          RED
        elsif row.adding?
          GREEN
        else # changed?
          GRAY
        end
      end
    end
  end
end
