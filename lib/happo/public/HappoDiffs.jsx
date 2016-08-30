/* global React */
const PropTypes = React.PropTypes;

const imageObjectStructure = {
  description: PropTypes.string.isRequired,
  viewport: PropTypes.string.isRequired,
  diff: PropTypes.string.isRequired,
  previous: PropTypes.string,
  current: PropTypes.string,
};

function imageSlug(image) {
  return btoa(image.description +  image.viewport);
}

function HappoImageHeading({ image }) {
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

function HappoNewImage({ image }) {
  return (
    <div>
      <HappoImageHeading
        image={image}
      />
      <img src={image.current} />
    </div>
  );
}

function HappoDiffImages({ images }) {
  if (!images.length) {
    return null;
  }

  return (
    <div>
      <h2 id='diffs'>
        <a className='anchored' href='#diffs'>
          Diffs ({ images.length })
        </a>
      </h2>

      {images.map((image, i) =>
        <HappoDiff
          key={i}
          image={image}
        />
      )}
    </div>
  );
}

function HappoNewImages({ images }) {
  if (!images.length) {
    return null;
  }

  return (
    <div>
      <h2 id='new'>
        <a className='anchored' href='#new'>
          New examples ({ images.length })
        </a>
      </h2>

      {images.map((image, i) =>
        <HappoNewImage
          key={i}
          image={image}
        />
      )}
    </div>
  );
}

function SelectedView({ image, selectedView }) {
  if (selectedView === 'side-by-side') {
    return (
      <div>
        <img src={image.previous} />
        <img src={image.current} />
      </div>
    );
  }

  if (selectedView === 'diff') {
    return (
      <img src={image.diff} />
    );
  }
};

const HappoDiff = React.createClass({
  propTypes: {
    image: PropTypes.shape(imageObjectStructure),
  },

  getInitialState() {
    return {
      selectedView: 'side-by-side',
    };
  },

  render() {
    const { image } = this.props;
    const { selectedView } = this.state;

    return (
      <div>
        <HappoImageHeading
          image={image}
        />
        <div className='happo-diff__buttons'>
          {['side-by-side', 'diff'].map((view) => {
            return (
              <button
                className='happo-diff__button'
                aria-pressed={view === selectedView}
                onClick={() => this.setState({ selectedView: view })}
              >
                {view}
              </button>
            );
          })}
        </div>
        <div className='happo-diff__images'>
          <SelectedView image={image} selectedView={selectedView} />
        </div>
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
          <HappoDiffImages
            images={this.props.diffImages}
          />
          <HappoNewImages
            images={this.props.newImages}
          />
        </main>
      </div>
    );
  }
});
