/* global React */
const PropTypes = React.PropTypes;

const VIEWS = {
  SIDE_BY_SIDE: 'side-by-side',
  DIFF: 'diff',
  SWIPE: 'swipe',
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

class Swiper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursorLeftPercent: 50, // Start in the center
    };
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  handleMouseMove(event) {
    const leftPx = event.pageX - event.target.offsetLeft;
    const leftPercent = leftPx / event.target.offsetWidth * 100;

    this.setState({
      cursorLeftPercent: leftPercent,
    })
  }

  render() {
    const { previous, current } = this.props;
    const { cursorLeftPercent } = this.state;

    const polygonPoints = [
      `${cursorLeftPercent}% 0`, // top leftmost point
      '100% 0', // top right corner
      '100% 100%', // bottom right cornder
      `${cursorLeftPercent}% 100%`, // bottom leftmost point
    ];
    const clipPath = `polygon(${polygonPoints.join(',')})`;

    return (
      <div
        className='Swiper'
        style={{
          backgroundImage: `url(${previous})`,
        }}
        onMouseMove={this.handleMouseMove}
      >
        <img
          className='Swiper__image'
          style={{
            WebkitClipPath: clipPath,
            MozClipPath: clipPath,
            clipPath: clipPath,
          }}
          src={current}
          role='presentation'
        />
        <div
          className='Swiper__cursor'
          style={{
            left: `${cursorLeftPercent}%`,
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
        {Object.keys(VIEWS).map(key => VIEWS[key]).map((view) => (
          <button
            key={view}
            className='Diff__button'
            aria-pressed={view === selectedView}
            onClick={() => { onClick(view); }}
          >
            {view}
          </button>
        ))}
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
