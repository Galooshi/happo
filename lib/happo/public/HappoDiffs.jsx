/* global React */
/* eslint-disable react/no-multi-comp */
const PropTypes = React.PropTypes;

const VIEWS = {
  SIDE_BY_SIDE: 'Side-by-side',
  SWIPE: 'Swipe',
  DIFF: 'Diff',
};

const imageShape = {
  description: PropTypes.string.isRequired,
  viewport: PropTypes.string.isRequired,
  diff: PropTypes.string,
  previous: PropTypes.string,
  current: PropTypes.string.isRequired,
};

function imageSlug(image) {
  return btoa(image.description + image.viewport);
}

function InlineLink({ children, to }) {
  return (
    <a className='InlineLink' href={`#${to}`}>
      {children}
    </a>
  );
}
InlineLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
};

function ImageHeading({ image }) {
  return (
    <h3 id={imageSlug(image)}>
      <InlineLink to={imageSlug(image)}>
        {image.description}
        {' @ '}
        {image.viewport}
      </InlineLink>
    </h3>
  );
}
ImageHeading.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
};

function NewImage({ image }) {
  return (
    <div>
      <ImageHeading
        image={image}
      />
      <img
        role='presentation'
        src={image.current}
      />
    </div>
  );
}
NewImage.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
};

function DiffImages({ images }) {
  if (!images.length) {
    return null;
  }

  return (
    <div>
      <h2 id='diffs'>
        <InlineLink to='diffs'>
          Diffs ({ images.length })
        </InlineLink>
      </h2>

      {images.map((image) => (
        <DiffController
          key={image.current}
          image={image}
        />
      ))}
    </div>
  );
}
DiffImages.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape(imageShape)).isRequired,
};

function NewImages({ images }) {
  if (!images.length) {
    return null;
  }

  return (
    <div>
      <h2 id='new'>
        <InlineLink to='new'>
          New examples ({ images.length })
        </InlineLink>
      </h2>

      {images.map((image) => (
        <NewImage
          key={image.current}
          image={image}
        />
      ))}
    </div>
  );
}
NewImages.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape(imageShape)).isRequired,
};

function maxImageSize(...imageUrls) {
  const dimensions = {};

  return new Promise((resolve, reject) => {
    imageUrls.forEach((url, i) => {
      const image = new Image();

      image.onerrer = function handleImageError(e) {
        reject(e);
      };

      image.onload = function handleImageLoad() {
        const { width, height } = this;

        // Use the index in case the URL is somehow duplicated.
        dimensions[i] = { width, height };

        if (Object.keys(dimensions).length >= imageUrls.length) {
          // We are done, so compute the max width and height and resolve.
          const values = Object.keys(dimensions).map(key => dimensions[key]);
          const maxWidth = Math.max(...values.map(value => value.width));
          const maxHeight = Math.max(...values.map(value => value.height));
          resolve({ width: maxWidth, height: maxHeight });
        }
      };

      image.src = url;
    });
  });
}

class Swiper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorLeft: 0,
      height: 'auto',
      width: 'auto',
    };
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentWillMount() {
    this.updateSize(this.props)
      .then(({ width }) => {
        // Start in the center
        this.setState({ cursorLeft: width / 2 });
      });
  }

  componentWillReceiveProps(nextProps) {
    this.updateSize(nextProps);
  }

  updateSize({ current, previous }) {
    const sizes = maxImageSize(current, previous)
      .then(({ width, height }) => {
        this.setState({ width, height });
        return { width, height };
      });

    return Promise.resolve(sizes);
  }

  handleMouseMove(event) {
    this.setState({
      cursorLeft: event.pageX - event.target.offsetLeft,
    });
  }

  render() {
    const { previous, current } = this.props;
    const { cursorLeft, height, width } = this.state;

    return (
      <div
        className='Swiper'
        style={{ height, width }}
        onMouseMove={this.handleMouseMove}
      >
        <div
          className='Swiper__image'
          style={{ width: cursorLeft }}
        >
          <img
            src={previous}
            role='presentation'
          />
        </div>

        <div
          className='Swiper__image'
          style={{
            transform: `translateX(${cursorLeft}px)`,
            width: width - cursorLeft,
          }}
        >
          <img
            src={current}
            style={{
              transform: `translateX(-${cursorLeft}px)`,
            }}
            role='presentation'
          />
        </div>

        <div
          className='Swiper__cursor'
          style={{
            transform: `translateX(${cursorLeft}px)`,
          }}
        />
      </div>
    );
  }
}
Swiper.propTypes = {
  previous: PropTypes.string.isRequired,
  current: PropTypes.string.isRequired,
};

function SideBySide({ previous, current }) {
  return (
    <div className='SideBySide'>
      <div className='SideBySide__image'>
        <img
          role='presentation'
          src={previous}
        />
        <div className='SideBySide__caption'>
          Before
        </div>
      </div>
      {' '}
      <div className='SideBySide__image'>
        <img
          role='presentation'
          src={current}
        />
        <div className='SideBySide__caption'>
          After
        </div>
      </div>
    </div>
  );
}
SideBySide.propTypes = {
  previous: PropTypes.string.isRequired,
  current: PropTypes.string.isRequired,
};

function SelectedView({ image, selectedView }) {
  if (selectedView === VIEWS.SIDE_BY_SIDE) {
    return (
      <SideBySide
        previous={image.previous}
        current={image.current}
      />
    );
  }

  if (selectedView === VIEWS.DIFF) {
    return (
      <img role='presentation' src={image.diff} />
    );
  }

  if (selectedView === VIEWS.SWIPE) {
    return (
      <Swiper
        previous={image.previous}
        current={image.current}
      />
    );
  }
}
SelectedView.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
  selectedView: PropTypes.oneOf(Object.keys(VIEWS).map(key => VIEWS[key])).isRequired,
};

class DiffController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedView: VIEWS.SIDE_BY_SIDE,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(view) {
    this.setState({ selectedView: view });
  }

  render() {
    return (
      <Diff
        image={this.props.image}
        selectedView={this.state.selectedView}
        onClick={this.handleClick}
      />
    );
  }
}
DiffController.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
};

function Diff({ image, selectedView, onClick }) {
  return (
    <div>
      <ImageHeading
        image={image}
      />
      <div className='Diff__buttons'>
        {Object.keys(VIEWS).map(key => VIEWS[key]).map((view, i) => {
          const classes = ['Diff__button'];
          if (i === 0) {
            classes.push('Diff__button--first');
          } else if (i === Object.keys(VIEWS).length - 1) {
            classes.push('Diff__button--last');
          }

          return (
            <button
              key={view}
              className={classes.join(' ')}
              aria-pressed={view === selectedView}
              onClick={() => { onClick(view); }}
            >
              {view}
            </button>
          );
        })}
      </div>
      <div className='Diff__images'>
        <SelectedView image={image} selectedView={selectedView} />
      </div>
    </div>
  );
}
Diff.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
  onClick: PropTypes.func.isRequired,
  selectedView: PropTypes.oneOf(Object.keys(VIEWS).map(key => VIEWS[key])).isRequired,
};

function HappoDiffs({ pageTitle, generatedAt, diffImages, newImages }) {
  return (
    <div>
      <header className='HappoDiffs__header'>
        <h1 className='HappoDiffs__headerTitle'>
          {pageTitle}
        </h1>
        <div className='HappoDiffs__headerTime'>
          Generated: {generatedAt}
        </div>
      </header>

      <main className='HappoDiffs__main'>
        <DiffImages
          images={diffImages}
        />
        <NewImages
          images={newImages}
        />
      </main>
    </div>
  );
}
HappoDiffs.propTypes = {
  pageTitle: PropTypes.string.isRequired,
  diffImages: PropTypes.arrayOf(imageShape).isRequired,
  newImages: PropTypes.arrayOf(imageShape).isRequired,
  generatedAt: PropTypes.string.isRequired,
};

window.HappoDiffs = HappoDiffs;
