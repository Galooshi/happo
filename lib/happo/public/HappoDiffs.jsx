const PropTypes = React.PropTypes;

const imageObjectStructure = {
  description: PropTypes.string.isRequired,
  viewport: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  beforeUrl: PropTypes.string,
  afterUrl: PropTypes.string,
};

function imageSlug(image) {
  return btoa(image.description +  image.viewport);
}

function renderImageHeading(image) {
  return (
    <h3 id={imageSlug(image)}>
      <a className='anchored' href={`#${imageSlug(image)}`}>
        {image.description}
        {' @ '}
        {image.viewport}
      </a>
    </h3>
  );
}

function renderNewImage(image) {
  return (
    <div>
      {renderImageHeading(image)}
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

      {diffImages.map((image, i) => (
        <HappoDiff
          key={i}
          image={image}
        />
      ))}
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

      {newImages.map(renderNewImage)}
    </div>
  );
}

const HappoDiff = React.createClass({
  propTypes: {
    image: PropTypes.shape(imageObjectStructure),
  },

  render() {
    const {
      image,
    } = this.props;

    return (
      <div>
        {renderImageHeading(image)}
        <img src={image.beforeUrl} />
        <img src={image.url} />
        <img src={image.afterUrl} />
      </div>
    );
  }
});

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
