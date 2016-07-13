module DiffuxCI
  module SnapshotComparisonImage
    # This subclass of `SnapshotComparisonImage` knows how to overlay the
    # after-image on top of the before-image, and render the difference in a
    # scaled magenta color.
    class Overlayed < SnapshotComparisonImage::Base
      WHITE_OVERLAY = ChunkyPNG::Color.fade(WHITE, 1 - BASE_ALPHA)

      # @param offset [Integer]
      # @param canvas [ChunkyPNG::Image]
      # @see SnapshotComparisonImage::Base
      def initialize(offset, canvas)
        @diff_pixels  = {}
        @faded_pixels = {}
        super
      end

      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_unchanged_row(y, row)
        # Render translucent original pixels
        row.new_element.each_with_index do |pixel, x|
          render_faded_pixel(x, y, pixel)
        end
      end

      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_deleted_row(y, row)
        row.old_element.each_with_index do |pixel_before, x|
          render_faded_magenta_pixel(TRANSPARENT, pixel_before, x, y)
        end
      end

      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_added_row(y, row)
        row.new_element.each_with_index do |pixel_after, x|
          render_faded_magenta_pixel(pixel_after, TRANSPARENT, x, y)
        end
      end

      # @param y [Integer]
      # @param row [Diff::LCS:ContextChange]
      def render_changed_row(y, row)
        row.old_element.zip(row.new_element).each_with_index do |pixels, x|
          pixel_before, pixel_after = pixels
          render_faded_magenta_pixel(
            pixel_after  || TRANSPARENT,
            pixel_before || TRANSPARENT,
            x, y)
        end
      end

      private

      # @param pixel_after [Integer]
      # @param pixel_before [Integer]
      # @param x [Integer]
      # @param y [Integer]
      def render_faded_magenta_pixel(pixel_after, pixel_before, x, y)
        score = pixel_diff_score(pixel_after, pixel_before)
        if score > 0
          render_diff_pixel(x, y, score)
        else
          render_faded_pixel(x, y, pixel_after)
        end
      end

      # @param x [Integer]
      # @param y [Integer]
      # @param score [Float]
      def render_diff_pixel(x, y, score)
        @diff_pixels[score] ||= compose_quick(fade(MAGENTA, diff_alpha(score)),
                                              WHITE)
        render_pixel(x, y, @diff_pixels[score])
      end

      # @param x [Integer]
      # @param y [Integer]
      # @param pixel [Integer]
      def render_faded_pixel(x, y, pixel)
        @faded_pixels[pixel] ||= compose_quick(WHITE_OVERLAY, pixel)
        render_pixel(x, y, @faded_pixels[pixel])
      end
    end
  end
end
