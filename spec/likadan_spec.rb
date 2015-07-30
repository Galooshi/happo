require 'yaml'
require 'tmpdir'

describe 'likadan' do
  let(:config) do
    {
      'source_files' => ['examples.js']
    }
  end

  let(:example_config) { '{}' }

  let(:examples_js) { <<-EOS }
    likadan.define('foo', function() {
      var elem = document.createElement('div');
      elem.innerHTML = 'Foo';
      document.body.appendChild(elem);
      return elem;
    }, #{example_config})
  EOS

  before do
    @tmp_dir = Dir.mktmpdir

    File.open(File.join(@tmp_dir, '.likadan.yaml'), 'w') do |f|
      f.write(config.to_yaml)
    end

    File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
      f.write(examples_js)
    end
  end

  after do
    #puts @tmp_dir
    FileUtils.remove_entry_secure @tmp_dir
  end

  def run_likadan
    pwd = Dir.pwd
    Dir.chdir @tmp_dir do
      system("#{pwd}/bin/likadan")
    end
  end

  describe 'with no previous run' do
    it 'generates a baseline' do
      run_likadan
      expect(
        File.exist?(
          File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'baseline.png')
        )
      ).to be(true)
    end

    it 'does not generate a diff' do
      run_likadan
      expect(
        File.exist?(
          File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'diff.png')
        )
      ).to be(false)
    end

    it 'does not create a candidate file' do
      run_likadan
      expect(
        File.exist?(
          File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'candidate.png')
        )
      ).to be(false)
    end
  end

  describe 'with a previous run' do
    context 'and no diff' do
      before do
        run_likadan
      end

      it 'keeps the baseline' do
        run_likadan
        expect(
          File.exist?(
            File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'baseline.png')
          )
        ).to be(true)
      end

      it 'does not generate a diff' do
        run_likadan
        expect(
          File.exist?(
            File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'diff.png')
          )
        ).to be(false)
      end

      it 'does not create a candidate file' do
        run_likadan
        expect(
          File.exist?(
            File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'candidate.png')
          )
        ).to be(false)
      end
    end

    context 'and there is a diff' do
      before do
        run_likadan

        File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
          f.write(<<-EOS)
            likadan.define('foo', function() {
              var elem = document.createElement('div');
              elem.innerHTML = 'Football';
              document.body.appendChild(elem);
              return elem;
            }, #{example_config})
          EOS
        end
      end

      it 'keeps the baseline' do
        run_likadan
        expect(
          File.exist?(
            File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'baseline.png')
          )
        ).to be(true)
      end

      it 'generates a diff' do
        run_likadan
        expect(
          File.exist?(
            File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'diff.png')
          )
        ).to be(true)
      end

      it 'generates a candidate file' do
        run_likadan
        expect(
          File.exist?(
            File.join(@tmp_dir, 'snapshots', 'foo', '@large', 'candidate.png')
          )
        ).to be(true)
      end
    end
  end
end
