#!/bin/bash -ex

# This is an example script that generates and uploads Happo diffs for the
# differences between the previous and current commit.

run-happo() {
  # Checkout the commit
  git checkout --quiet $1

  # Install dependencies and precompile the JavaScript bundle
  npm install
  webpack ./entry.js bundle.js

  # Run happo for the current commit. We use `xvfb-run` so that we can run
  # happo (which uses Firefox) in a headless display environment.
  xvfb-run happo run
}

# Check out the previous version and generate snapshots
run-happo HEAD^

# Check out the latest version and check for diffs
run-happo -

# Finally, upload any diffs to s3
url_to_diffs=`happo upload`
if [ -n "$url_to_diffs" ]; then
  # We have a URL to the diff(s) found for the commit. We have a couple of
  # options here:
  #
  # 1. Exit the script with a non-zero exit code. This will likely make the CI
  #    run fail.
  # 2. Allow the script to pass, but instead post a comment to the commit with
  #    the URL to the diff(s).
  #
  # Below is an example of the latter, where we post back a comment to a Gerrit
  # patch set.
  message="Happo diff(s) were found: $link_to_diffs"

  ssh -p 29418 jenkins@example.com \
    gerrit review \'--message="$message"\' $GERRIT_PATCHSET_REVISION
fi

