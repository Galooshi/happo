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

function HappoDiff({ image }) {
  return (
    <div>
      <HappoImageHeading
        image={image}
      />
      <div className='happo-diff__images'>
        <img src={image.previous} />
        <img src={image.diff} />
        <img src={image.current} />
      </div>
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
