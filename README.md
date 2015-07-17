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
```

## Running the tool

Just run `likadan` from the command line. This will start up Firefox and start
taking snapshots of all your examples.

## Reviewing snapshots

Once that has finished, run `likadan review` from the command line. This will
open a page that compares the latest run's snapshots against the previously
accepted snapshots. You can then approve or reject the snapshots for the next
run.
