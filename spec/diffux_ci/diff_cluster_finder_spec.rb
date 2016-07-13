require 'diffux_ci/diff_cluster_finder'

describe DiffuxCI::DiffClusterFinder do
  let(:rows)   { 100 }
  let(:finder) { described_class.new(rows) }

  describe '#clusters' do
    subject { finder.clusters }

    context 'when no different rows have been reported' do
      it { is_expected.to be_empty }
    end

    context 'when the first row is different' do
      before { finder.row_is_different(0) }

      it 'has one cluster' do
        expect(subject.count).to eq(1)
      end

      it 'has a cluster starting at 0' do
        expect(subject.first[:start]).to eq(0)
      end

      it 'has a cluster ending at 0' do
        expect(subject.first[:finish]).to eq(0)
      end
    end

    context 'when the last four rows are different' do
      before do
        4.times { |i| finder.row_is_different(rows - i - 1) }
      end

      it 'has one cluster' do
        expect(subject.count).to eq(1)
      end

      it 'has a cluster starting at the right row' do
        expect(subject.first[:start]).to eq(rows - 4)
      end

      it 'has a cluster ending at the last line' do
        expect(subject.first[:finish]).to eq(rows - 1)
      end
    end

    context 'with two clusters' do
      before do
        finder.row_is_different(20)
        finder.row_is_different(23)
        finder.row_is_different(27)

        finder.row_is_different(60)
        finder.row_is_different(61)
      end

      it 'has two clusters' do
        expect(subject.count).to eq(2)
      end

      it 'has a correct first cluster' do
        expect(subject.first[:start]).to eq(20)
        expect(subject.first[:finish]).to eq(27)
      end

      it 'has a correct second cluster' do
        expect(subject[1][:start]).to eq(60)
        expect(subject[1][:finish]).to eq(61)
      end
    end

    context 'with all rows different' do
      before do
        rows.times { |i| finder.row_is_different(i) }
      end

      it 'has one cluster' do
        expect(subject.count).to eq(1)
      end

      it 'has a cluster starting at the first row' do
        expect(subject.first[:start]).to eq(0)
      end

      it 'has a cluster ending at the last line' do
        expect(subject.first[:finish]).to eq(rows - 1)
      end
    end
  end

  describe '#percent_of_rows_different' do
    subject { finder.percent_of_rows_different }

    context 'when no different rows have been reported' do
      it { is_expected.to eq(0.0) }
    end

    context 'when one row is different' do
      before { finder.row_is_different(0) }

      it 'reports a one percent difference' do
        expect(subject).to eq(1.0)
      end
    end
  end
end
