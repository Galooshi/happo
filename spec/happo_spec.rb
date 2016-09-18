require 'yaml'
require 'tmpdir'
require 'open3'
require 'base64'
require 'chunky_png'

describe 'happo' do
  let(:config) do
    {
      'source_files' => ['examples.js']
    }
  end

  let(:example_config) { '{}' }
  let(:description) { 'foo' }

  let(:examples_js) { <<-EOS }
    happo.define('#{description}', function() {
      var elem = document.createElement('div');
      elem.innerHTML = 'Foo';
      elem.style.lineHeight = '20px';
      document.body.appendChild(elem);
    }, #{example_config});
  EOS

  before do
    @tmp_dir = Dir.mktmpdir

    File.open(File.join(@tmp_dir, '.happo.yaml'), 'w') do |f|
      f.write(config.to_yaml)
    end

    File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
      f.write(examples_js)
    end
  end

  after do
    FileUtils.remove_entry_secure @tmp_dir
  end

  def filter_std_err(std_err)
    std_err.split("\n").reject do |line|
      line.start_with? '== Sinatra'
    end.join("\n")
  end

  def run_happo(opts = {})
    pwd = Dir.pwd
    Dir.chdir @tmp_dir do
      std_out, std_err, status =
        Open3.capture3("ruby -I#{pwd}/lib #{pwd}/bin/happo")

      if status.exitstatus != 0 && !opts[:disable_raise_errors]
        filtered_std_err = filter_std_err(std_err)
        raise filtered_std_err unless filtered_std_err.empty?
      end

      {
        std_out: std_out,
        std_err: std_err,
        exit_status: status.exitstatus
      }
    end
  end

  def snapshot_file_name(description, size, file_name)
    File.join(
      @tmp_dir,
      'snapshots',
      Base64.strict_encode64(description).strip,
      size,
      file_name
    )
  end

  def snapshot_file_exists?(description, size, file_name)
    File.exist?(snapshot_file_name(description, size, file_name))
  end

  describe 'with no previous run' do
    it 'exits with a zero exit code' do
      expect(run_happo[:exit_status]).to eq(0)
    end

    it 'generates a new current' do
      run_happo
      expect(snapshot_file_exists?(description, '@large', 'previous.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'current.png'))
        .to eq(true)
      expect(
        YAML.load(File.read(File.join(
          @tmp_dir, 'snapshots', 'result_summary.yaml')))
      ).to eq(
        new_examples: [
          {
            description: description,
            viewport: 'large',
            height: 20,
          }
        ],
        diff_examples: [],
        okay_examples: [],
        height: 20,
      )
    end
  end

  describe 'with nested elements' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        var elem = document.createElement('div');

        var nested = document.createElement('span');
        nested.innerHTML = 'Foo';
        elem.appendChild(nested);

        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    it 'exits with a zero exit code' do
      expect(run_happo[:exit_status]).to eq(0)
    end

    it 'generates a new current' do
      run_happo
      expect(snapshot_file_exists?(description, '@large', 'previous.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'current.png'))
        .to eq(true)
      expect(
        YAML.load(File.read(File.join(
          @tmp_dir, 'snapshots', 'result_summary.yaml')))
      ).to eq(
        new_examples: [
          {
            description: description,
            viewport: 'large',
            height: 20,
          }
        ],
        diff_examples: [],
        okay_examples: []
      )
    end
  end

  describe 'with an element rendering at the bottom right' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        var elem = document.createElement('div');
        elem.style.position = 'fixed';
        elem.style.height = '40px';
        elem.style.width = '40px';
        elem.style.bottom = '0px';
        elem.style.right = '0px';
        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    it 'includes the component in the snapshot' do
      run_happo
      path = snapshot_file_name(description, '@large', 'current.png')
      image = ChunkyPNG::Image.from_file(path)
      expect(image.width).to eq(40)
      expect(image.height).to eq(40)
    end
  end

  describe 'with an overflowing element' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        var elem = document.createElement('div');
        #{overflow}
        elem.style.overflow = 'scroll';
        elem.style.height = '40px';
        elem.style.width = '40px';

        var nested = document.createElement('div');
        nested.style.background = '#ff0000';
        nested.style.height = '200%';
        nested.style.width = '200%';
        elem.appendChild(nested);

        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    let(:no_scrollbar) do
      run_happo
      path = snapshot_file_name(description, '@large', 'current.png')
      image = ChunkyPNG::Image.from_file(path)

      red = ChunkyPNG::Color.from_hex('#ff0000ff')
      white = ChunkyPNG::Color.from_hex('#ffffffff')
      image.pixels.all? do |pixel|
        # We have to include white because our method for getting the dimensions
        # of the element currently includes the full dimensions of anythng
        # hidden by overflow containers.
        pixel == red || pixel == white
      end
    end

    context 'with `overflow: scroll`' do
      let(:overflow) { 'elem.style.overflow = "scroll";' }

      it 'exits with a zero exit code' do
        expect(run_happo[:exit_status]).to eq(0)
      end

      it 'does not capture a scrollbar' do
        expect(no_scrollbar).to eq(true)
      end

      it 'generates a new current' do
        run_happo
        expect(snapshot_file_exists?(description, '@large', 'previous.png'))
          .to eq(false)
        expect(snapshot_file_exists?(description, '@large', 'current.png'))
          .to eq(true)
        expect(
          YAML.load(File.read(File.join(
            @tmp_dir, 'snapshots', 'result_summary.yaml')))
        ).to eq(
          new_examples: [
            {
              description: description,
              viewport: 'large',
              height: 80,
            }
          ],
          diff_examples: [],
          okay_examples: []
        )
      end
    end

    context 'with `overflow-x: auto`' do
      let(:overflow) { 'elem.style.overflowX = "auto";' }

      it 'does not have a scrollbar' do
        expect(no_scrollbar).to eq(true)
      end
    end

    context 'with `overflow-y: auto`' do
      let(:overflow) { 'elem.style.overflowY = "auto";' }

      it 'does not have a scrollbar' do
        expect(no_scrollbar).to eq(true)
      end
    end
  end

  describe 'with multiple top-level elements' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        var first = document.createElement('div');
        first.innerText = 'Foo';
        first.style.height = '40px';
        first.style.width = '40px';
        document.body.appendChild(first);

        var second = document.createElement('div');
        second.innerText = 'Bar';
        second.style.height = '40px';
        second.style.width = '40px';
        document.body.appendChild(second);
      }, #{example_config});
    EOS

    it 'exits with a zero exit code' do
      expect(run_happo[:exit_status]).to eq(0)
    end

    it 'generates a new current' do
      run_happo
      expect(snapshot_file_exists?(description, '@large', 'previous.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'current.png'))
        .to eq(true)
      expect(
        YAML.load(File.read(File.join(
          @tmp_dir, 'snapshots', 'result_summary.yaml')))
      ).to eq(
        new_examples: [
          {
            description: description,
            viewport: 'large',
            height: 80,
          }
        ],
        diff_examples: [],
        okay_examples: []
      )
    end

    it 'has both elements' do
      run_happo
      path = snapshot_file_name(description, '@large', 'current.png')
      image = ChunkyPNG::Image.from_file(path)
      expect(image.height).to eq(80)
    end
  end

  describe 'with margin' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        var elem = document.createElement('div');
        elem.style.margin = '10px';
        elem.style.lineHeight = '20px';
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    it 'exits with a zero exit code' do
      expect(run_happo[:exit_status]).to eq(0)
    end

    it 'generates a new current' do
      run_happo
      expect(snapshot_file_exists?(description, '@large', 'previous.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'current.png'))
        .to eq(true)
      expect(
        YAML.load(File.read(File.join(
          @tmp_dir, 'snapshots', 'result_summary.yaml')))
      ).to eq(
        new_examples: [
          {
            description: description,
            viewport: 'large',
            height: 40,
          }
        ],
        diff_examples: [],
        okay_examples: []
      )
    end
  end

  describe 'with an element rendered outside the screen' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        var elem = document.createElement('div');
        elem.style.margin = '-5px';
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    it 'exits with a zero exit code' do
      expect(run_happo[:exit_status]).to eq(0)
    end
  end

  describe 'with a previous run' do
    context 'and no diff' do
      before do
        run_happo
      end

      it 'exits with a zero exit code' do
        expect(run_happo[:exit_status]).to eq(0)
      end

      it 'keeps the current' do
        run_happo
        expect(snapshot_file_exists?(description, '@large', 'previous.png'))
          .to eq(false)
        expect(snapshot_file_exists?(description, '@large', 'current.png'))
          .to eq(true)
        expect(
          YAML.load(File.read(File.join(
            @tmp_dir, 'snapshots', 'result_summary.yaml')))
        ).to eq(
          okay_examples: [
            {
              description: description,
              viewport: 'large',
              height: 20,
            }
          ],
          new_examples: [],
          diff_examples: []
        )
      end
    end

    context 'and there is a diff' do
      it 'exits with a zero exit code' do
        expect(run_happo[:exit_status]).to eq(0)
      end

      context 'and the previous has height' do
        before do
          run_happo

          File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
            f.write(<<-EOS)
              happo.define('#{description}', function() {
                var elem = document.createElement('div');
                elem.innerHTML = 'Football';
                document.body.appendChild(elem);
              }, #{example_config});
            EOS
          end
        end

        it 'keeps the previous' do
          run_happo
          expect(snapshot_file_exists?(description, '@large', 'previous.png'))
            .to eq(true)
          expect(snapshot_file_exists?(description, '@large', 'current.png'))
            .to eq(true)
          expect(
            YAML.load(File.read(File.join(
              @tmp_dir, 'snapshots', 'result_summary.yaml')))
          ).to eq(
            diff_examples: [
              {
                description: description,
                viewport: 'large',
                height: 20,
              }
            ],
            new_examples: [],
            okay_examples: []
          )
        end
      end
    end

    context 'and the previous does not have height' do
      let(:examples_js) { <<-EOS }
        happo.define('#{description}', function() {
          var elem = document.createElement('div');
          document.body.appendChild(elem);
        }, #{example_config});
      EOS

      before do
        run_happo

        File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
          f.write(<<-EOS)
            happo.define('#{description}', function() {
              var elem = document.createElement('div');
              elem.innerHTML = 'Foo';
              document.body.appendChild(elem);
            }, #{example_config});
          EOS
        end
      end

      it 'keeps the previous' do
        run_happo
        expect(snapshot_file_exists?(description, '@large', 'previous.png'))
          .to eq(true)
        expect(snapshot_file_exists?(description, '@large', 'current.png'))
          .to eq(true)
      end
    end
  end

  describe 'with more than one viewport' do
    let(:example_config) { "{ viewports: ['large', 'small'] }" }

    it 'generates the right current' do
      run_happo
      expect(snapshot_file_exists?(description, '@large', 'current.png'))
        .to eq(true)
      expect(snapshot_file_exists?(description, '@small', 'current.png'))
        .to eq(true)
      expect(snapshot_file_exists?(description, '@medium', 'current.png'))
        .to eq(false)
    end
  end

  describe 'with custom viewports in .happo.yaml' do
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
        run_happo
        expect(snapshot_file_exists?(description, '@foo', 'current.png'))
          .to eq(true)
        expect(snapshot_file_exists?(description, '@bar', 'current.png'))
          .to eq(false)
      end
    end

    context 'and the example has a `viewport` config' do
      let(:example_config) { "{ viewports: ['bar'] }" }

      it 'uses the viewport to generate a current' do
        run_happo
        expect(snapshot_file_exists?(description, '@foo', 'current.png'))
          .to eq(false)
        expect(snapshot_file_exists?(description, '@bar', 'current.png'))
          .to eq(true)
      end
    end
  end

  describe 'with doneCallback async argument' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function(done) {
        setTimeout(function() {
          var elem = document.createElement('div');
          elem.innerHTML = 'Foo';
          document.body.appendChild(elem);
          done();
        });
      }, #{example_config});
    EOS

    it 'generates a current' do
      run_happo
      expect(snapshot_file_exists?(description, '@large', 'previous.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'current.png'))
        .to eq(true)
    end

    describe 'with a previous run' do
      context 'and no diff' do
        before do
          run_happo
        end

        it 'keeps the existing current' do
          run_happo
          expect(snapshot_file_exists?(description, '@large', 'previous.png'))
            .to eq(false)
          expect(snapshot_file_exists?(description, '@large', 'current.png'))
            .to eq(true)
        end
      end

      context 'and there is a diff' do
        context 'and the previous has height' do
          before do
            run_happo

            File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
              f.write(<<-EOS)
                happo.define('#{description}', function(done) {
                  setTimeout(function() {
                    var elem = document.createElement('div');
                    elem.innerHTML = 'Football';
                    document.body.appendChild(elem);
                    done();
                  });
                }, #{example_config});
              EOS
            end
          end

          it 'keeps the previous' do
            run_happo
            expect(snapshot_file_exists?(description, '@large', 'previous.png'))
              .to eq(true)
            expect(snapshot_file_exists?(description, '@large', 'current.png'))
              .to eq(true)
          end
        end
      end
    end
  end

  describe 'when returning a Promise' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            var elem = document.createElement('div');
            elem.innerHTML = 'Daenerys Targaryen';
            document.body.appendChild(elem);
            resolve();
          });
        });
      }, #{example_config});
    EOS

    it 'generates a new current' do
      run_happo
      expect(snapshot_file_exists?(description, '@large', 'previous.png'))
        .to eq(false)
      expect(snapshot_file_exists?(description, '@large', 'current.png'))
        .to eq(true)
    end

    describe 'with a previous run' do
      context 'and no diff' do
        before do
          run_happo
        end

        it 'keeps the current' do
          run_happo
          expect(snapshot_file_exists?(description, '@large', 'previous.png'))
            .to eq(false)
          expect(snapshot_file_exists?(description, '@large', 'current.png'))
            .to eq(true)
        end
      end

      context 'and there is a diff' do
        context 'and the previous has height' do
          before do
            run_happo

            File.open(File.join(@tmp_dir, 'examples.js'), 'w') do |f|
              f.write(<<-EOS)
                happo.define('#{description}', function(done) {
                  setTimeout(function() {
                    var elem = document.createElement('div');
                    elem.innerHTML = 'Jon Snow';
                    document.body.appendChild(elem);
                    done();
                  });
                }, #{example_config});
              EOS
            end
          end

          it 'keeps the previous' do
            run_happo
            expect(snapshot_file_exists?(description, '@large', 'previous.png'))
              .to eq(true)
            expect(snapshot_file_exists?(description, '@large', 'current.png'))
              .to eq(true)
          end
        end
      end
    end
  end

  describe 'when an example fails' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        throw new Error('fail!');
      });
    EOS

    it 'exits with a non-zero exit code' do
      result = run_happo(disable_raise_errors: true)
      expect(result[:exit_status]).to eq(1)
    end

    it 'logs the error' do
      result = run_happo(disable_raise_errors: true)
      expect(result[:std_err])
        .to include("Error while rendering \"#{description}\"")
    end
  end

  describe 'when multiple examples are defined' do
    let(:examples_js) { <<-EOS }
      happo.define('foo', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
      }, #{example_config});

      happo.define('bar', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Bar';
        document.body.appendChild(elem);
      }, #{example_config});

      happo.define('baz', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Baz';
        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    it 'generates current for each example' do
      run_happo
      expect(snapshot_file_exists?('foo', '@large', 'current.png')).to eq(true)
      expect(snapshot_file_exists?('bar', '@large', 'current.png')).to eq(true)
      expect(snapshot_file_exists?('baz', '@large', 'current.png')).to eq(true)
    end
  end

  describe 'when there are two examples with the same description' do
    let(:examples_js) { <<-EOS }
      happo.define('#{description}', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
      }, #{example_config});

      happo.define('#{description}', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Bar';
        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    it 'exits with a non-zero exit code' do
      result = run_happo(disable_raise_errors: true)
      expect(result[:exit_status]).to eq(1)
    end

    it 'logs the error' do
      result = run_happo(disable_raise_errors: true)
      expect(result[:std_err])
        .to include("Error while defining \\\"#{description}\\\"")
    end
  end

  describe 'when using fdefine' do
    let(:examples_js) { <<-EOS }
      happo.define('foo', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Foo';
        document.body.appendChild(elem);
      }, #{example_config});

      happo.fdefine('fiz', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Fiz';
        document.body.appendChild(elem);
      }, #{example_config});

      happo.fdefine('bar', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Bar';
        document.body.appendChild(elem);
      }, #{example_config});

      happo.define('baz', function() {
        var elem = document.createElement('div');
        elem.innerHTML = 'Baz';
        document.body.appendChild(elem);
      }, #{example_config});
    EOS

    it 'generates current for the fdefined examples' do
      run_happo

      expect(snapshot_file_exists?('foo', '@large', 'current.png'))
        .to eq(false)
      expect(snapshot_file_exists?('fiz', '@large', 'current.png'))
        .to eq(true)
      expect(snapshot_file_exists?('bar', '@large', 'current.png'))
        .to eq(true)
      expect(snapshot_file_exists?('baz', '@large', 'current.png'))
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
      happo.define('img', function() {
        return new Promise(function(resolve, reject) {
          var image = new Image();
          image.onload = function() {
            // Continue to process the image once it is found without any errors
            resolve();
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
      output = run_happo
      expect(output[:std_err]).not_to include('image not found')
    end
  end

  describe 'when other files cannot be found in public directories' do
    let(:examples_js) { <<-EOS }
      happo.define('img', function() {
        return new Promise( function(resolve, reject) {
          var image = new Image();
          image.onload = function() {
            // Continue to process the image once it is found without any errors
            resolve();
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
      result = run_happo(disable_raise_errors: true)
      expect(result[:std_err]).to include('image not found')
    end
  end
end
