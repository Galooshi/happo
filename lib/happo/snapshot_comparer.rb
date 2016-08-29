require 'oily_png'
require 'diff-lcs'

module Happo
  # This class is responsible for comparing two Snapshots and generating a diff.
  class SnapshotComparer
    include ChunkyPNG::Color
    BASE_OPACITY    = 0.1
    BASE_ALPHA      = (255 * BASE_OPACITY).round
    BASE_DIFF_ALPHA = BASE_ALPHA * 2
    MAGENTA = ChunkyPNG::Color.from_hex '#b33682'
    WHITE_OVERLAY = ChunkyPNG::Color.fade(WHITE, 1 - BASE_ALPHA)

    # @param png_before [ChunkyPNG::Image]
    # @param png_after  [ChunkyPNG::Image]
    def initialize(png_before, png_after)
      @png_after  = png_after
      @png_before = png_before

      @diff_pixels  = {}
      @faded_pixels = {}
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

      max_height = [@png_after.height, @png_before.height].max
      max_width = [@png_after.width, @png_before.width].max

      diff_image = ChunkyPNG::Image.new(max_width, max_height)

      number_of_different_pixels = 0

      max_height.times do |y|
        max_width.times do |x|
          pixel_before = @png_before.get_pixel(x, y)
          pixel_after = @png_after.get_pixel(x, y)
          number_of_different_pixels += 1 unless pixel_before == pixel_after
          diff_image.set_pixel(x, y, faded_magenta_pixel(
            pixel_after  || TRANSPARENT,
            pixel_before || TRANSPARENT
          ))
        end
      end

      # Even though we have a check at the top to see image equality, there's
      # still a chance we end up here with no differenve. This might happen if
      # some of the headers are different.
      return no_diff if number_of_different_pixels.zero?

      percent_changed =
        number_of_different_pixels.to_f / max_width * max_height * 100

      {
        diff_in_percent: percent_changed,
        diff_image:      (diff_image if percent_changed.positive?),
      }
    end

    private

    # Compute a score that represents the difference between 2 pixels
    #
    # This method simply takes the Euclidean distance between the RGBA channels
    # of 2 colors over the maximum possible Euclidean distance. This gives us a
    # percentage of how different the two colors are.
    #
    # Although it would be more perceptually accurate to calculate a proper
    # Delta E in Lab colorspace, we probably don't need perceptual accuracy for
    # this application, and it is nice to avoid the overhead of converting RGBA
    # to Lab.
    #
    # @param pixel_after [Integer]
    # @param pixel_before [Integer]
    # @return [Float] number between 0 and 1 where 1 is completely different
    #   and 0 is no difference
    def pixel_diff_score(pixel_after, pixel_before)
      ChunkyPNG::Color::euclidean_distance_rgba(pixel_after, pixel_before) /
        ChunkyPNG::Color::MAX_EUCLIDEAN_DISTANCE_RGBA
    end

    # @param pixel_after [Integer]
    # @param pixel_before [Integer]
    def faded_magenta_pixel(pixel_after, pixel_before)
      score = pixel_diff_score(pixel_after, pixel_before)
      if score > 0
        diff_pixel(score)
      else
        faded_pixel(pixel_after)
      end
    end

    # @param diff_score [Float]
    # @return [Integer] a number between 0 and 255 that represents the alpha
    #   channel of of the difference
    def diff_alpha(diff_score)
      (BASE_DIFF_ALPHA + ((255 - BASE_DIFF_ALPHA) * diff_score)).round
    end

    # @param score [Float]
    def diff_pixel(score)
      @diff_pixels[score] ||=
        compose_quick(fade(MAGENTA, diff_alpha(score)), WHITE)
    end

    # @param pixel [Integer]
    def faded_pixel(pixel)
      @faded_pixels[pixel] ||=
        compose_quick(WHITE_OVERLAY, pixel)
    end
  end
end
