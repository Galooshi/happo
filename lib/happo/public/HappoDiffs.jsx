const PropTypes = React.PropTypes;

const imageObjectStructure = {
  description: PropTypes.string.isRequired,
  viewport: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

function imageSlug(image) {
  // TODO can we just use btoa() here?
  return btoa(image.description +  image.viewport);
}

function renderImage(image) {
  return (
    <div>
      <h3 id={imageSlug(image)}>
        <a className='anchored' href={`#${imageSlug(image)}`}>
          {image.description}
          {' @ '}
          {image.viewport}
        </a>
      </h3>
      <img src={image.url} />
    </div>
  );
}

function renderDiffImages(diffImages) {
  if (!diffImages.length) {
    return null;
  }

  return (
    <div>
      <h2 id='diffs'>
        <a className='anchored' href='#diffs'>
          Diffs ({ diffImages.length })
        </a>
      </h2>

      {diffImages.map(renderImage)}
    </div>
  );
}

function renderNewImages(newImages) {
  if (!newImages.length) {
    return null;
  }

  return (
    <div>
      <h2 id='new'>
        <a className='anchored' href='#new'>
          New examples ({ newImages.length })
        </a>
      </h2>

      {newImages.map(renderImage)}
    </div>
  );
}

window.HappoDiffs = React.createClass({
  propTypes: {
    pageTitle: PropTypes.string.isRequired,
    diffImages: PropTypes.arrayOf(imageObjectStructure).isRequired,
    newImages: PropTypes.arrayOf(imageObjectStructure).isRequired,
    generatedAt: PropTypes.string.isRequired,
  },

  render() {
    return (
      <div>
        <header className='header'>
          <h1 className='header_title'>
            {this.props.pageTitle}
          </h1>
          <div className='header__time'>
            Generated: {this.props.generatedAt}
          </div>
        </header>

        <main className='main'>
          {renderDiffImages(this.props.diffImages)}
          {renderNewImages(this.props.newImages)}
        </main>
      </div>
    );
  }
});
