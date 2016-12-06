const uploadLastResult = require('../uploadLastResult');

jest.mock('../getLastResultSummary');
const getLastResultSummary = require('../getLastResultSummary');

jest.mock('../S3Uploader');
const S3Uploader = require('../S3Uploader');

it('resolves without a URL when there are no diffs or new images', () => {
  getLastResultSummary.mockImplementation(() => ({
    diffImages: [],
    newImages: [],
  }));

  uploadLastResult().then((url) => {
    expect(url).toBe(undefined);
  });
});

describe('when there are files to upload', () => {
  let uploadMock;

  beforeEach(() => {
    uploadMock = jest.fn();
    uploadMock.mockReturnValue(Promise.resolve());
    S3Uploader.mockImplementation(() => ({
      prepare: () => Promise.resolve(),
      upload: uploadMock,
    }));
  });

  it('uploads all images and the index.html file when there are diffs and new images', () => {
    getLastResultSummary.mockImplementation(() => ({
      diffImages: [
        {
          description: 'foo',
          height: 50,
          viewportName: 'small',
        },
        {
          description: 'bar',
          height: 100,
          viewportName: 'medium',
        },
      ],
      newImages: [
        {
          description: 'foo',
          height: 50,
          viewportName: 'small',
        },
      ],
    }));

    uploadLastResult().then(() => {
      // 2 times each diff, 1 times the new image, 1 times index.html
      expect(uploadMock.mock.calls.length).toEqual(6);
    });
  });

  it('can upload when there are only new images', () => {
    getLastResultSummary.mockImplementation(() => ({
      diffImages: [],
      newImages: [
        {
          description: 'foo',
          height: 50,
          viewportName: 'small',
        },
      ],
    }));

    uploadLastResult().then(() => {
      // 1 times the new image, 1 times index.html
      expect(uploadMock.mock.calls.length).toEqual(2);
    });
  });
});
