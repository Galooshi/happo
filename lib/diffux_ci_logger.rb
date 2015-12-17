# Used for all CLI output
class DiffuxCILogger
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
end
