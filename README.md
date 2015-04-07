# Likadan

Likadan is a command-line tool to visually diff JavaScript components.

## Installation
Likadan comes bundled as a gem. To install it, run `gem install likadan`.

## Configuration
Likadan can be configured through a `.likadan.yaml` file, placed in the root of
your project.

```yaml
source_files:
 - application.js
 - likadan-examples.js
stylesheets:
 - application.css
snapshots_folder: ./snapshots
viewport_widths:
 - 320
 - 640
 - 1200
setup_commands:
 - ./scripts/precompile-javascript.sh
 - ./scripts/precompile-stylesheets.sh
```

## Running the tool
Just run `likadan` from your command line.
