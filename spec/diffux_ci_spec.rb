require 'yaml'
require 'tmpdir'
require 'open3'

describe 'diffux_ci' do
  let(:config) do
    {
      'source_files' => ['examples.js']
    }
  end

  let(:example_config) { '{}' }

  let(:examples_js) { <<-EOS }
    diffux.define('foo', function() {
      var elem = document.createElement('div');
      elem.innerHTML = 'Foo';
      document.body.appendChild(elem);
      return elem;
    }, #{example_config})
  EOS

  before do
    @tmp_dir = Dir.mktmpdir

    File.open(File.join(@tmp_dir, '.diffux_ci.yaml'), 'w') do |f|
      f.write(config.to_yaml)
    end

    File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
      f.write(examples_js)
    end
  end

  after do
    FileUtils.remove_entry_secure @tmp_dir
  end

  def run_diffux_ci
    pwd = Dir.pwd
    Dir.chdir @tmp_dir do
      std_out, std_err, status =
        Open3.capture3("ruby -I#{pwd}/lib #{pwd}/bin/diffux_ci")
      {
        std_out: std_out,
        std_err: std_err,
        exit_status: status.exitstatus
      }
    end
  end

  def snapshot_file_exists?(size, file_name)
    File.exist?(
      File.join(@tmp_dir, 'snapshots', 'foo', size, file_name)
    )
  end

  describe 'with no previous run' do
    it 'exits with a zero exit code' do
      expect(run_diffux_ci[:exit_status]).to eq(0)
    end

    it 'generates a baseline, but no diff' do
      run_diffux_ci
      expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
      expect(snapshot_file_exists?('@large', 'diff.png')).to eq(false)
      expect(snapshot_file_exists?('@large', 'candidate.png')).to eq(false)
    end
  end

  describe 'with a previous run' do
    context 'and no diff' do
      before do
        run_diffux_ci
      end

      it 'exits with a zero exit code' do
        expect(run_diffux_ci[:exit_status]).to eq(0)
      end

      it 'keeps the baseline, and creates no diff' do
        run_diffux_ci
        expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
        expect(snapshot_file_exists?('@large', 'diff.png')).to eq(false)
        expect(snapshot_file_exists?('@large', 'candidate.png')).to eq(false)
      end
    end

    context 'and there is a diff' do
      it 'exits with a zero exit code' do
        expect(run_diffux_ci[:exit_status]).to eq(0)
      end

      context 'and the baseline has height' do
        before do
          run_diffux_ci

          File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
            f.write(<<-EOS)
              diffux.define('foo', function() {
                var elem = document.createElement('div');
                elem.innerHTML = 'Football';
                document.body.appendChild(elem);
                return elem;
              }, #{example_config})
            EOS
          end
        end

        it 'keeps the baseline, and generates a diff' do
          run_diffux_ci
          expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
          expect(snapshot_file_exists?('@large', 'diff.png')).to eq(true)
          expect(snapshot_file_exists?('@large', 'candidate.png')).to eq(true)
        end
      end
    end

    context 'and the baseline does not have height' do
      let(:examples_js) { <<-EOS }
        diffux.define('foo', function() {
          var elem = document.createElement('div');
          document.body.appendChild(elem);
          return elem;
        }, #{example_config})
      EOS

      before do
        run_diffux_ci

        File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
          f.write(<<-EOS)
            diffux.define('foo', function() {
              var elem = document.createElement('div');
              elem.innerHTML = 'Foo';
              document.body.appendChild(elem);
              return elem;
            }, #{example_config})
          EOS
        end
      end

      it 'keeps the baseline, and generates a diff' do
        run_diffux_ci
        expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
        expect(snapshot_file_exists?('@large', 'diff.png')).to eq(true)
        expect(snapshot_file_exists?('@large', 'candidate.png')).to eq(true)
      end
    end
  end

  describe 'with more than one viewport' do
    let(:example_config) { "{ viewports: ['large', 'small'] }" }

    it 'generates the right baselines' do
      run_diffux_ci
      expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
      expect(snapshot_file_exists?('@small', 'baseline.png')).to eq(true)
      expect(snapshot_file_exists?('@medium', 'baseline.png')).to eq(false)
    end
  end

  describe 'with custom viewports in .diffux_ci.yaml' do
    let(:config) do
      {
        'source_files' => ['examples.js'],
        'viewports' => {
          'foo' => {
            'width' => 320,
            'height' => 500
          },
          'bar' => {
            'width' => 640,
            'height' => 1000
          }
        }
      }
    end

    context 'and the example has no `viewport` config' do
      it 'uses the first viewport in the config' do
        run_diffux_ci
        expect(snapshot_file_exists?('@foo', 'baseline.png')).to eq(true)
        expect(snapshot_file_exists?('@bar', 'baseline.png')).to eq(false)
      end
    end

    context 'and the example has a `viewport` config' do
      let(:example_config) { "{ viewports: ['bar'] }" }

      it 'uses the viewport to generate a baseline' do
        run_diffux_ci
        expect(snapshot_file_exists?('@foo', 'baseline.png')).to eq(false)
        expect(snapshot_file_exists?('@bar', 'baseline.png')).to eq(true)
      end
    end
  end

  describe 'with doneCallback async argument' do
    let(:examples_js) { <<-EOS }
      diffux.define('foo', function(done) {
        setTimeout(function() {
          var elem = document.createElement('div');
          elem.innerHTML = 'Foo';
          document.body.appendChild(elem);
          done(elem);
        });
      }, #{example_config})
    EOS

    it 'generates a baseline, but no diff' do
      run_diffux_ci
      expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
      expect(snapshot_file_exists?('@large', 'diff.png')).to eq(false)
      expect(snapshot_file_exists?('@large', 'candidate.png')).to eq(false)
    end

    describe 'with a previous run' do
      context 'and no diff' do
        before do
          run_diffux_ci
        end

        it 'keeps the baseline, and creates no diff' do
          run_diffux_ci
          expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
          expect(snapshot_file_exists?('@large', 'diff.png')).to eq(false)
          expect(snapshot_file_exists?('@large', 'candidate.png')).to eq(false)
        end
      end

      context 'and there is a diff' do
        context 'and the baseline has height' do
          before do
            run_diffux_ci

            File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
              f.write(<<-EOS)
                diffux.define('foo', function(done) {
                  setTimeout(function() {
                    var elem = document.createElement('div');
                    elem.innerHTML = 'Football';
                    document.body.appendChild(elem);
                    done(elem);
                  });
                }, #{example_config})
              EOS
            end
          end

          it 'keeps the baseline, and generates a diff' do
            run_diffux_ci
            expect(snapshot_file_exists?('@large', 'baseline.png')).to eq(true)
            expect(snapshot_file_exists?('@large', 'diff.png')).to eq(true)
            expect(snapshot_file_exists?('@large', 'candidate.png')).to eq(true)
          end
        end
      end
    end
  end

  describe 'when an example fails' do
    let(:examples_js) { <<-EOS }
      diffux.define('foo', function() {
        return undefined;
      });
    EOS

    it 'exits with a non-zero exit code' do
      expect(run_diffux_ci[:exit_status]).to eq(1)
    end

    it 'logs the error' do
      expect(run_diffux_ci[:std_err]).to include('Error while rendering "foo"')
    end
  end
end
