module Happo
  # Used for all CLI output
  class Logger
    # @param out [IO] the output destination
    def initialize(out = STDOUT)
      @out = out
    end

    # Print the specified output
    # @param str [String] the output to send
    # @param newline [Boolean] whether to append a newline
    def log(str, newline = true)
      @out.print(str)
      @out.print("\n") if newline
    end

    # Mark the string in cyan
    # @param str [String] the str to format
    def cyan(str)
      color(36, str)
    end

    private

    # Whether this logger is outputting to a TTY
    #
    # @return [Boolean]
    def tty?
      @out.respond_to?(:tty?) && @out.tty?
    end

    # Mark the string in a color
    # @see http://ascii-table.com/ansi-escape-sequences.php
    # @param color_code [Number] the ANSI color code
    # @param str [String] the str to format
    def color(color_code, str)
      tty? ? str : "\033[#{color_code}m#{str}\033[0m"
    end
  end
end
