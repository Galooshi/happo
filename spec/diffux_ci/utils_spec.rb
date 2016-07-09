require 'diffux_ci/utils'
require 'base64'

describe DiffuxCI::Utils do
  before do
    allow(DiffuxCI::Utils).to receive(:config_from_file).and_return({})
  end

  describe 'construct_url' do
    subject { DiffuxCI::Utils.construct_url(absolute_path, params) }

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

  describe 'normalize_description' do
    subject { DiffuxCI::Utils.normalize_description(description) }

    context 'with special characters' do
      let(:description) { '<MyComponent> something interesting' }
      it { should eq(Base64.strict_encode64(description).strip) }
    end

    context 'when very long' do
      let(:description) { <<-EOS }
        <MyComponent> something interesting and something that ends up being
        very very long for some reason which might end up causing problems
        depending on how we encode the description
      EOS

      it { is_expected.to_not include "\n" }
    end
  end

  describe 'path_to' do
    subject { DiffuxCI::Utils.path_to(description, viewport_name, file_name) }
    let(:description) { '<MyComponent>' }
    let(:viewport_name) { 'large' }
    let(:file_name) { 'diff.png' }
    it { should eq("./snapshots/#{Base64.strict_encode64(description).strip}/@large/diff.png") }
  end
end
