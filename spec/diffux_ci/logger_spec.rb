require 'diffux_ci/logger'

describe DiffuxCI::Logger do
  let(:io)     { StringIO.new }
  let(:logger) { described_class.new(io) }

  describe '#log' do
    subject { io.string }

    it 'adds a newline' do
      logger.log('Hi mom')
      expect(subject).to eq "Hi mom\n"
    end

    context 'when disabling trailing newline' do
      it 'does not add a newline' do
        logger.log('Hi mom', false)
        expect(subject).to eq 'Hi mom'
      end
    end
  end

  describe '#cyan' do
    subject { logger.cyan('Hi mom') }

    context 'when IO is a TTY' do
      before do
        allow(io).to receive(:tty?) { true }
      end

      it { should_not include '36' }
    end

    context 'when IO is not a TTY' do
      before do
        allow(io).to receive(:tty?) { false }
      end

      it { should include '36' }
    end
  end
end
