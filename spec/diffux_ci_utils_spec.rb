require 'diffux_ci_utils'

describe 'DiffuxCIUtils' do
  before do
    allow(DiffuxCIUtils).to receive(:config_from_file).and_return({})
  end

  describe 'construct_url' do
    subject { DiffuxCIUtils.construct_url(absolute_path, params) }

    context 'without absolute_path or params' do
      let(:absolute_path) { '' }
      let(:params) { {} }
      it { should eq('http://localhost:4567') }
    end

    context 'with absolute_path and no params' do
      let(:absolute_path) { '/alexander-hamilton' }
      let(:params) { {} }
      it { should eq('http://localhost:4567/alexander-hamilton') }
    end

    context 'with params and no absolute_path' do
      let(:absolute_path) { '' }
      let(:params) { { revolution: 'yes', burr: 'no' } }
      it { should eq('http://localhost:4567?revolution=yes&burr=no') }
    end

    context 'with params and absolute_path' do
      let(:absolute_path) { '/alexander-hamilton' }
      let(:params) { { revolution: 'yes', burr: 'no' } }
      it do
        should eq(
          'http://localhost:4567/alexander-hamilton?revolution=yes&burr=no')
      end
    end

    context 'when params have special characters' do
      let(:absolute_path) { '' }
      let(:params) { { revolution: 'yes & absolutely' } }
      it { should eq('http://localhost:4567?revolution=yes+%26+absolutely') }
    end
  end
end
