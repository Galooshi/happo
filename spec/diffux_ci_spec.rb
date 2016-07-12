require 'yaml'
require 'tmpdir'
require 'open3'
require 'base64'

describe 'diffux_ci' do
  let(:config) do
    {
      'source_files' => ['examples.js']
    }
  end

  let(:example_config) { '{}' }
  let(:description) { 'foo' }

  let(:examples_js) { <<-EOS }
    diffux.define('#{description}', function() {
      var elem = document.createElement('div');
      elem.innerHTML = 'Foo';
      document.body.appendChild(elem);
      return elem;
    }, #{example_config});
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

  def run_diffux
    pwd = Dir.pwd
    Dir.chdir @tmp_dir do
      std_out, std_err, status =
        Open3.capture3("ruby -I#{pwd}/lib #{pwd}/bin/diffux")
      {
        std_out: std_out,
        std_err: std_err,
        exit_status: status.exitstatus
      }
    end
  end

  def snapshot_file_exists?(description, size, file_name)
    File.exist?(
      File.join(@tmp_dir, 'snapshots',
                Base64.strict_encode64(description).strip, size, file_name)
    )
  end

  describe 'with no previous run' do
    it 'exits with a zero exit code' do
      expect(run_diffux[:exit_status]).to eq(0)
    end

    it 'generates a new baseline, but no diff' do
      run_diffux
      expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
        .to eq(true)
      expect(snapshot_file_exists?(description, '@large', 'diff.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
        .to eq(false)
      expect(
        YAML.load(File.read(File.join(
          @tmp_dir, 'snapshots', 'result_summary.yaml')))
      ).to eq(
        new_examples: [
          {
            description: description,
            viewport: 'large'
          }
        ],
        diff_examples: [],
        okay_examples: []
      )
    end
  end

  describe 'with a previous run' do
    context 'and no diff' do
      before do
        run_diffux
      end

      it 'exits with a zero exit code' do
        expect(run_diffux[:exit_status]).to eq(0)
      end

      it 'keeps the baseline, and creates no diff' do
        run_diffux
        expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
          .to eq(true)
        expect(snapshot_file_exists?(description, '@large', 'diff.png'))
          .to eq(false)
        expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
          .to eq(false)
        expect(
          YAML.load(File.read(File.join(
            @tmp_dir, 'snapshots', 'result_summary.yaml')))
        ).to eq(
          okay_examples: [
            {
              description: description,
              viewport: 'large'
            }
          ],
          new_examples: [],
          diff_examples: []
        )
      end
    end

    context 'and there is a diff' do
      it 'exits with a zero exit code' do
        expect(run_diffux[:exit_status]).to eq(0)
      end

      context 'and the baseline has height' do
        before do
          run_diffux

          File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
            f.write(<<-EOS)
              diffux.define('#{description}', function() {
                var elem = document.createElement('div');
                elem.innerHTML = 'Football';
                document.body.appendChild(elem);
                return elem;
              }, #{example_config});
            EOS
          end
        end

        it 'keeps the baseline, and generates a diff' do
          run_diffux
          expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
            .to eq(true)
          expect(snapshot_file_exists?(description, '@large', 'diff.png'))
            .to eq(true)
          expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
            .to eq(true)
          expect(
            YAML.load(File.read(File.join(
              @tmp_dir, 'snapshots', 'result_summary.yaml')))
          ).to eq(
            diff_examples: [
              {
                description: description,
                viewport: 'large'
              }
            ],
            new_examples: [],
            okay_examples: []
          )
        end
      end
    end

    context 'and the baseline does not have height' do
      let(:examples_js) { <<-EOS }
        diffux.define('#{description}', function() {
          var elem = document.createElement('div');
          document.body.appendChild(elem);
          return elem;
        }, #{example_config});
      EOS

      before do
        run_diffux

        File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
          f.write(<<-EOS)
            diffux.define('#{description}', function() {
              var elem = document.createElement('div');
              elem.innerHTML = 'Foo';
              document.body.appendChild(elem);
              return elem;
            }, #{example_config});
          EOS
        end
      end

      it 'keeps the baseline, and generates a diff' do
        run_diffux
        expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
          .to eq(true)
        expect(snapshot_file_exists?(description, '@large', 'diff.png'))
          .to eq(true)
        expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
          .to eq(true)
      end
    end
  end

  describe 'with more than one viewport' do
    let(:example_config) { "{ viewports: ['large', 'small'] }" }

    it 'generates the right baselines' do
      run_diffux
      expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
        .to eq(true)
      expect(snapshot_file_exists?(description, '@small', 'baseline.png'))
        .to eq(true)
      expect(snapshot_file_exists?(description, '@medium', 'baseline.png'))
        .to eq(false)
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
        run_diffux
        expect(snapshot_file_exists?(description, '@foo', 'baseline.png'))
          .to eq(true)
        expect(snapshot_file_exists?(description, '@bar', 'baseline.png'))
          .to eq(false)
      end
    end

    context 'and the example has a `viewport` config' do
      let(:example_config) { "{ viewports: ['bar'] }" }

      it 'uses the viewport to generate a baseline' do
        run_diffux
        expect(snapshot_file_exists?(description, '@foo', 'baseline.png'))
          .to eq(false)
        expect(snapshot_file_exists?(description, '@bar', 'baseline.png'))
          .to eq(true)
      end
    end
  end

  describe 'with doneCallback async argument' do
    let(:examples_js) { <<-EOS }
      diffux.define('#{description}', function(done) {
        setTimeout(function() {
          var elem = document.createElement('div');
          elem.innerHTML = 'Foo';
          document.body.appendChild(elem);
          done(elem);
        });
      }, #{example_config});
    EOS

    it 'generates a baseline, but no diff' do
      run_diffux
      expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
        .to eq(true)
      expect(snapshot_file_exists?(description, '@large', 'diff.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
        .to eq(false)
    end

    describe 'with a previous run' do
      context 'and no diff' do
        before do
          run_diffux
        end

        it 'keeps the baseline, and creates no diff' do
          run_diffux
          expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
            .to eq(true)
          expect(snapshot_file_exists?(description, '@large', 'diff.png'))
            .to eq(false)
          expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
            .to eq(false)
        end
      end

      context 'and there is a diff' do
        context 'and the baseline has height' do
          before do
            run_diffux

            File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
              f.write(<<-EOS)
                diffux.define('#{description}', function(done) {
                  setTimeout(function() {
                    var elem = document.createElement('div');
                    elem.innerHTML = 'Football';
                    document.body.appendChild(elem);
                    done(elem);
                  });
                }, #{example_config});
              EOS
            end
          end

          it 'keeps the baseline, and generates a diff' do
            run_diffux
            expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
              .to eq(true)
            expect(snapshot_file_exists?(description, '@large', 'diff.png'))
              .to eq(true)
            expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
              .to eq(true)
          end
        end
      end
    end
  end

  describe 'when returning a Promise' do
    let(:examples_js) { <<-EOS }
      diffux.define('#{description}', function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            var elem = document.createElement('div');
            elem.innerHTML = 'Daenerys Targaryen';
            document.body.appendChild(elem);
            resolve(elem);
          });
        });
      }, #{example_config});
    EOS

    it 'generates a baseline, but no diff' do
      run_diffux
      expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
        .to eq(true)
      expect(snapshot_file_exists?(description, '@large', 'diff.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
        .to eq(false)
    end

    describe 'with a previous run' do
      context 'and no diff' do
        before do
          run_diffux
        end

        it 'keeps the baseline, and creates no diff' do
          run_diffux
          expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
            .to eq(true)
          expect(snapshot_file_exists?(description, '@large', 'diff.png'))
            .to eq(false)
          expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
            .to eq(false)
        end
      end

      context 'and there is a diff' do
        context 'and the baseline has height' do
          before do
            run_diffux

            File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
              f.write(<<-EOS)
                diffux.define('#{description}', function(done) {
                  setTimeout(function() {
                    var elem = document.createElement('div');
                    elem.innerHTML = 'Jon Snow';
                    document.body.appendChild(elem);
                    done(elem);
                  });
                }, #{example_config});
              EOS
            end
          end

          it 'keeps the baseline, and generates a diff' do
            run_diffux
            expect(snapshot_file_exists?(description, '@large', 'baseline.png'))
              .to eq(true)
            expect(snapshot_file_exists?(description, '@large', 'diff.png'))
              .to eq(true)
            expect(snapshot_file_exists?(description, '@large', 'candidate.png'))
              .to eq(true)
          end
        end
      end
    end
  end

  describe 'when an example fails' do
    let(:examples_js) { <<-EOS }
      diffux.define('#{description}', function() {
        return undefined;
      });
    EOS

    it 'exits with a non-zero exit code' do
      expect(run_diffux[:exit_status]).to eq(1)
    end

    it 'logs the error' do
      expect(run_diffux[:std_err])
        .to include("Error while rendering \"#{description}\"")
    end
  end

  describe 'when multiple examples are defined' do
    let(:examples_js) { <<-EOS }
      diffux.define('foo', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});

      diffux.define('bar', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Bar';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});

      diffux.define('baz', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Baz';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});
    EOS

    it 'generates baselines for each example' do
      run_diffux
      expect(snapshot_file_exists?('foo', '@large', 'baseline.png')).to eq(true)
      expect(snapshot_file_exists?('bar', '@large', 'baseline.png')).to eq(true)
      expect(snapshot_file_exists?('baz', '@large', 'baseline.png')).to eq(true)
    end
  end

  describe 'when there are two examples with the same description' do
    let(:examples_js) { <<-EOS }
      diffux.define('#{description}', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});

      diffux.define('#{description}', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Bar';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});
    EOS

    it 'exits with a non-zero exit code' do
      expect(run_diffux[:exit_status]).to eq(1)
    end

    it 'logs the error' do
      expect(run_diffux[:std_err])
        .to include("Error while defining \\\"#{description}\\\"")
    end
  end

  describe 'when using fdefine' do
    let(:examples_js) { <<-EOS }
      diffux.define('foo', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});

      diffux.fdefine('fiz', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Fiz';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});

      diffux.fdefine('bar', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Bar';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});

      diffux.define('baz', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Baz';
        document.body.appendChild(elem);
        return elem;
      }, #{example_config});
    EOS

    it 'generates baselines for the fdefined examples' do
      run_diffux

      expect(snapshot_file_exists?('foo', '@large', 'baseline.png'))
        .to eq(false)
      expect(snapshot_file_exists?('fiz', '@large', 'baseline.png'))
        .to eq(true)
      expect(snapshot_file_exists?('bar', '@large', 'baseline.png'))
        .to eq(true)
      expect(snapshot_file_exists?('baz', '@large', 'baseline.png'))
        .to eq(false)
    end
  end

  describe 'when additional files are served from public directories' do
    before do
      tmp_pub_dir = File.join(@tmp_dir, 'public')
      Dir.mkdir(tmp_pub_dir)

      File.open(File.join(tmp_pub_dir, 'picture.gif'), 'wb') do |f|
        tiny_gif = 'R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        f.write(Base64.decode64(tiny_gif))
      end
    end

    let(:config) do
      {
        'source_files' => ['examples.js'],
        'public_directories' => ['public']
      }
    end

    let(:examples_js) { <<-EOS }
      diffux.define('img', function() {
        return new Promise(function(resolve, reject) {
          var image = new Image();
          image.onload = function() {
            // Continue to process the image once it is found without any errors
            resolve(image);
          };
          image.onerror = function() {
            // Throws an error if the image is not found.
            // The error message will then show up in std_err, so for our test,
            // we can check that the error message should not show up.
            reject(new Error('image not found'));
          };
          image.src = 'picture.gif';
          document.body.appendChild(image);
        });
      }, #{example_config});
    EOS

    it 'gets file from other directory' do
      output = run_diffux
      expect(output[:std_err]).not_to include('image not found');
    end
  end

  describe 'when other files cannot be found in public directories' do
    let(:examples_js) { <<-EOS }
      diffux.define('img', function() {
        return new Promise( function(resolve, reject) {
          var image = new Image();
          image.onload = function() {
            // Continue to process the image once it is found without any errors
            resolve(image);
          };
          image.onerror = function() {
            // Throws an error if the image is not found.
            // The error message will then show up in std_err, so for our test,
            // we can check that the error message should show up
            reject(new Error('image not found'));
          };
          image.src = 'wrong_picture.png';
          document.body.appendChild(image);
        });
      }, #{example_config});
    EOS

    it 'gets error when trying to get file from other directory' do
      expect(run_diffux[:std_err]).to include('image not found');
    end
  end
end
