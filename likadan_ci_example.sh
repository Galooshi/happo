#!/bin/bash -ex

# This is an example script that generates and uploads Likadan diffs for the
# differences between the previous and current commit.

run-likadan() {
  # Checkout the commit
  git checkout --quiet $1

  # Install dependencies and precompile the JavaScript bundle
  npm install
  webpack ./entry.js bundle.js

  # Run likadan for the current commit. We use `xvfb-run` so that we can run
  # likadan (which uses Firefox) in a headless display environment.
  xvfb-run likadan
}

# Check out the previous version and generate baseline snapshots
run-likadan HEAD^

# Check out the latest version and check for diffs
run-likadan -

# Finally, upload any diffs to s3
url_to_diffs=`likadan upload_diffs`
if [ -n "$url_to_diffs" ]; then
  # We have a URL to the diff(s) found for the commit. We can choose to do one
  # of a few things here. We either exit the script with a non-zero exit code.
  # This will likely make the CI run fail. We can also allow the script to pass,
  # but instead post a comment to the commit with the URL to the diff(s). Below
  # is an example of the latter, where we post back a comment to a Gerrit patch
  # set.
  message="Likadan diff(s) were found: $link_to_diffs"

  ssh -p 29418 jenkins@example.com \
    gerrit review \'--message="$message"\' $GERRIT_PATCHSET_REVISION
fi

