require 'diffux_ci/snapshot_comparer'
require 'oily_png'

describe DiffuxCI::SnapshotComparer do
  def image(width: 2, height: 2, color: ChunkyPNG::Color::WHITE)
    ChunkyPNG::Image.new(width, height, color)
  end

  describe '#compare!' do
    let(:png_before) { image }
    let(:png_after)  { image }
    let(:snapshot_comparer) do
      described_class.new(png_before, png_after)
    end
    subject { snapshot_comparer.compare! }

    context 'with identical snapshots' do
      it 'reports no difference' do
        expect(subject[:diff_in_percent]).to eq(0.0)
      end

      it 'reports no diff image' do
        expect(subject[:diff_image]).to eq(nil)
      end

      it 'reports no cluster differences' do
        expect(subject[:diff_clusters]).to be_empty
      end
    end

    context 'with entirely different snapshots' do
      let(:png_after) { image(color: ChunkyPNG::Color::BLACK) }

      it 'reports a 100% difference' do
        expect(subject[:diff_in_percent]).to eq(100.0)
      end

      it 'reports a diff image' do
        expect(subject[:diff_image]).to_not eq(nil)
      end

      it 'reports one cluster difference' do
        expect(subject[:diff_clusters].count).to eq(1)
      end
    end

    context 'when the after snapshot is half as tall as the before snapshot' do
      let(:png_after) { image(height: 1) }

      it 'reports a 50% difference' do
        expect(subject[:diff_in_percent]).to eq(50.0)
      end

      it 'reports one cluster difference' do
        expect(subject[:diff_clusters].count).to eq(1)
      end
    end

    context 'when the after snapshot is twice as tall as the before snapshot' do
      let(:png_after) { image(height: 4) }

      it 'reports a 50% difference' do
        expect(subject[:diff_in_percent]).to eq(50.0)
      end

      it 'returns an image of the correct height' do
        expect(subject[:diff_image].height).to eq(4)
      end

      it 'reports one cluster difference' do
        expect(subject[:diff_clusters].count).to eq(1)
      end
    end

    context 'when the after snapshot half as wide as the before snapshot' do
      let(:png_after) { image(width: 1) }

      it 'reports a 100% difference' do
        expect(subject[:diff_in_percent]).to eq(100.0)
      end
    end

    context 'when the before snapshot is twice as wide as the after snapshot' do
      let(:png_before) { image(width: 4) }

      it 'reports a 100% difference' do
        expect(subject[:diff_in_percent]).to eq(100.0)
      end
    end

    context 'when the after snapshot is twice as wide as the before snapshot' do
      let(:png_after) { image(width: 4) }

      it 'reports a 100% difference' do
        expect(subject[:diff_in_percent]).to eq(100.0)
      end
    end
  end
end
