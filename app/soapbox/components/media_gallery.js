import React from 'react';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { is } from 'immutable';
import IconButton from './icon_button';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { isIOS } from '../is_mobile';
import classNames from 'classnames';
import { decode } from 'blurhash';
import { isPanoramic, isPortrait, isNonConformingRatio, minimumAspectRatio, maximumAspectRatio } from '../utils/media_aspect_ratio';
import { Map as ImmutableMap } from 'immutable';
import { getSettings } from 'soapbox/actions/settings';
import StillImage from 'soapbox/components/still_image';

const messages = defineMessages({
  toggle_visible: { id: 'media_gallery.toggle_visible', defaultMessage: 'Toggle visibility' },
});

const mapStateToItemProps = state => ({
  autoPlayGif: getSettings(state).get('autoPlayGif'),
});

@connect(mapStateToItemProps)
class Item extends React.PureComponent {

  static propTypes = {
    attachment: ImmutablePropTypes.map.isRequired,
    standalone: PropTypes.bool,
    index: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    displayWidth: PropTypes.number,
    visible: PropTypes.bool.isRequired,
    dimensions: PropTypes.object,
    autoPlayGif: PropTypes.bool,
  };

  static defaultProps = {
    standalone: false,
    index: 0,
    size: 1,
  };

  state = {
    loaded: false,
  };

  handleMouseEnter = (e) => {
    if (this.hoverToPlay()) {
      e.target.play();
    }
  }

  handleMouseLeave = (e) => {
    if (this.hoverToPlay()) {
      e.target.pause();
      e.target.currentTime = 0;
    }
  }

  hoverToPlay() {
    const { attachment, autoPlayGif } = this.props;
    return !autoPlayGif && attachment.get('type') === 'gifv';
  }

  handleClick = (e) => {
    const { index, onClick } = this.props;

    if (isIOS() && !e.target.autoPlay) {
      e.target.autoPlay = true;
      e.preventDefault();
    } else {
      if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
        if (this.hoverToPlay()) {
          e.target.pause();
          e.target.currentTime = 0;
        }
        e.preventDefault();
        onClick(index);
      }
    }

    e.stopPropagation();
  }

  componentDidMount() {
    if (this.props.attachment.get('blurhash')) {
      this._decode();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.attachment.get('blurhash') !== this.props.attachment.get('blurhash') && this.props.attachment.get('blurhash')) {
      this._decode();
    }
  }

  _decode() {
    const hash   = this.props.attachment.get('blurhash');
    const pixels = decode(hash, 32, 32);

    if (pixels) {
      const ctx       = this.canvas.getContext('2d');
      const imageData = new ImageData(pixels, 32, 32);

      ctx.putImageData(imageData, 0, 0);
    }
  }

  setCanvasRef = c => {
    this.canvas = c;
  }

  handleImageLoad = () => {
    this.setState({ loaded: true });
  }

  render() {
    const { attachment, standalone, visible, dimensions, autoPlayGif } = this.props;

    let width  = 100;
    let height = '100%';
    let top    = 'auto';
    let left   = 'auto';
    let bottom = 'auto';
    let right  = 'auto';
    let float = 'left';
    let position = 'relative';

    if (dimensions) {
      width = dimensions.w;
      height = dimensions.h;
      top = dimensions.t || 'auto';
      right = dimensions.r || 'auto';
      bottom = dimensions.b || 'auto';
      left = dimensions.l || 'auto';
      float = dimensions.float || 'left';
      position = dimensions.pos || 'relative';
    }

    let thumbnail = '';

    if (attachment.get('type') === 'unknown') {
      return (
        <div className={classNames('media-gallery__item', { standalone })} key={attachment.get('id')} style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}>
          <a className='media-gallery__item-thumbnail' href={attachment.get('remote_url')} target='_blank' style={{ cursor: 'pointer' }}>
            <canvas width={32} height={32} ref={this.setCanvasRef} className='media-gallery__preview' />
          </a>
        </div>
      );
    } else if (attachment.get('type') === 'image') {
      const previewUrl   = attachment.get('preview_url');

      const originalUrl   = attachment.get('url');

      thumbnail = (
        <a
          className='media-gallery__item-thumbnail'
          href={attachment.get('remote_url') || originalUrl}
          onClick={this.handleClick}
          target='_blank'
        >
          <StillImage src={previewUrl} alt={attachment.get('description')} />
        </a>
      );
    } else if (attachment.get('type') === 'gifv') {
      let conditionalAttributes = {};
      if (isIOS()) {
        conditionalAttributes.playsInline = '1';
      }
      if (autoPlayGif) {
        conditionalAttributes.autoPlay = '1';
      }

      thumbnail = (
        <div className={classNames('media-gallery__gifv', { autoplay: autoPlayGif })}>
          <video
            className='media-gallery__item-gifv-thumbnail'
            aria-label={attachment.get('description')}
            title={attachment.get('description')}
            role='application'
            src={attachment.get('url')}
            onClick={this.handleClick}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            loop
            muted
            {...conditionalAttributes}
          />

          <span className='media-gallery__gifv__label'>GIF</span>
        </div>
      );
    }

    return (
      <div className={classNames('media-gallery__item', { standalone })} key={attachment.get('id')} style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}>
        <canvas width={32} height={32} ref={this.setCanvasRef} className={classNames('media-gallery__preview', { 'media-gallery__preview--hidden': visible && this.state.loaded })} />
        {visible && thumbnail}
      </div>
    );
  }

}

const mapStateToMediaGalleryProps = state => ({
  displayMedia: getSettings(state).get('displayMedia'),
});

export default @connect(mapStateToMediaGalleryProps)
@injectIntl
class MediaGallery extends React.PureComponent {

  static propTypes = {
    sensitive: PropTypes.bool,
    standalone: PropTypes.bool,
    media: ImmutablePropTypes.list.isRequired,
    size: PropTypes.object,
    height: PropTypes.number.isRequired,
    onOpenMedia: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    defaultWidth: PropTypes.number,
    cacheWidth: PropTypes.func,
    visible: PropTypes.bool,
    onToggleVisibility: PropTypes.func,
    displayMedia: PropTypes.string,
  };

  static defaultProps = {
    standalone: false,
  };

  state = {
    visible: this.props.visible !== undefined ? this.props.visible : (this.props.displayMedia !== 'hide_all' && !this.props.sensitive || this.props.displayMedia === 'show_all'),
    width: this.props.defaultWidth,
  };

  componentWillReceiveProps(nextProps) {
    const { displayMedia } = this.props;
    if (!is(nextProps.media, this.props.media) && nextProps.visible === undefined) {
      this.setState({ visible: displayMedia !== 'hide_all' && !nextProps.sensitive || displayMedia === 'show_all' });
    } else if (!is(nextProps.visible, this.props.visible) && nextProps.visible !== undefined) {
      this.setState({ visible: nextProps.visible });
    }
  }

  handleOpen = () => {
    if (this.props.onToggleVisibility) {
      this.props.onToggleVisibility();
    } else {
      this.setState({ visible: !this.state.visible });
    }
  }

  handleClick = (index) => {
    this.props.onOpenMedia(this.props.media, index);
  }

  handleRef = (node) => {
    if (node) {
      // offsetWidth triggers a layout, so only calculate when we need to
      if (this.props.cacheWidth) this.props.cacheWidth(node.offsetWidth);

      this.setState({
        width: node.offsetWidth,
      });
    }
  }

  getSizeDataSingle = () => {
    const { media, defaultWidth } = this.props;
    const width = this.state.width || defaultWidth;
    const aspectRatio = media.getIn([0, 'meta', 'small', 'aspect']);

    const getHeight = () => {
      if (!aspectRatio) return width*9/16;
      if (isPanoramic(aspectRatio)) return Math.floor(width / maximumAspectRatio);
      if (isPortrait(aspectRatio))  return Math.floor(width / minimumAspectRatio);
      return Math.floor(width / aspectRatio);
    };

    return ImmutableMap({
      style: { height: getHeight() },
      itemsDimensions: [],
      size: 1,
      width,
    });
  }

  getSizeDataMultiple = size => {
    const { media, defaultWidth } = this.props;
    const width = this.state.width || defaultWidth;
    const panoSize = Math.floor(width / maximumAspectRatio);
    const panoSize_px = `${Math.floor(width / maximumAspectRatio)}px`;

    const style = {};
    let itemsDimensions = [];

    const ratios = Array(size).fill().map((_, i) =>
      media.getIn([i, 'meta', 'small', 'aspect'])
    );

    const [ar1, ar2, ar3, ar4] = ratios;

    if (size === 2) {
      if (isPortrait(ar1) && isPortrait(ar2)) {
        style.height = width - (width / maximumAspectRatio);
      } else if (isPanoramic(ar1) && isPanoramic(ar2)) {
        style.height = panoSize * 2;
      } else if (
        (isPanoramic(ar1) && isPortrait(ar2)) ||
        (isPortrait(ar1) && isPanoramic(ar2)) ||
        (isPanoramic(ar1) && isNonConformingRatio(ar2)) ||
        (isNonConformingRatio(ar1) && isPanoramic(ar2))
      ) {
        style.height = (width * 0.6) + (width / maximumAspectRatio);
      } else {
        style.height = width / 2;
      }

      //

      if (isPortrait(ar1) && isPortrait(ar2)) {
        itemsDimensions = [
          { w: 50, h: '100%', r: '2px' },
          { w: 50, h: '100%', l: '2px' },
        ];
      } else if (isPanoramic(ar1) && isPanoramic(ar2)) {
        itemsDimensions = [
          { w: 100, h: panoSize_px, b: '2px' },
          { w: 100, h: panoSize_px, t: '2px' },
        ];
      } else if (
        (isPanoramic(ar1) && isPortrait(ar2)) ||
        (isPanoramic(ar1) && isNonConformingRatio(ar2))
      ) {
        itemsDimensions = [
          { w: 100, h: `${(width / maximumAspectRatio)}px`, b: '2px' },
          { w: 100, h: `${(width * 0.6)}px`, t: '2px' },
        ];
      } else if (
        (isPortrait(ar1) && isPanoramic(ar2)) ||
        (isNonConformingRatio(ar1) && isPanoramic(ar2))
      ) {
        itemsDimensions = [
          { w: 100, h: `${(width * 0.6)}px`, b: '2px' },
          { w: 100, h: `${(width / maximumAspectRatio)}px`, t: '2px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '100%', r: '2px' },
          { w: 50, h: '100%', l: '2px' },
        ];
      }
    } else if (size === 3) {
      if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) {
        style.height = panoSize * 3;
      } else if (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3)) {
        style.height = Math.floor(width / minimumAspectRatio);
      } else {
        style.height = width;
      }

      //

      if (isPanoramic(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3)) {
        itemsDimensions = [
          { w: 100, h: '50%', b: '2px' },
          { w: 50, h: '50%', t: '2px', r: '2px' },
          { w: 50, h: '50%', t: '2px', l: '2px' },
        ];
      } else if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) {
        itemsDimensions = [
          { w: 100, h: panoSize_px, b: '4px' },
          { w: 100, h: panoSize_px },
          { w: 100, h: panoSize_px, t: '4px' },
        ];
      } else if (isPortrait(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3)) {
        itemsDimensions = [
          { w: 50, h: '100%', r: '2px' },
          { w: 50, h: '50%', b: '2px', l: '2px' },
          { w: 50, h: '50%', t: '2px', l: '2px' },
        ];
      } else if (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPortrait(ar3)) {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '50%', l: '-2px', b: '-2px', pos: 'absolute', float: 'none' },
          { w: 50, h: '100%', r: '-2px', t: '0px', b: '0px', pos: 'absolute', float: 'none' },
        ];
      } else if (
        (isNonConformingRatio(ar1) && isPortrait(ar2) && isNonConformingRatio(ar3)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3))
      ) {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '100%', l: '2px', float: 'right' },
          { w: 50, h: '50%', t: '2px', r: '2px' },
        ];
      } else if (
        (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3)) ||
        (isPanoramic(ar1) && isPanoramic(ar2) && isPortrait(ar3))
      ) {
        itemsDimensions = [
          { w: 50, h: panoSize_px, b: '2px', r: '2px' },
          { w: 50, h: panoSize_px, b: '2px', l: '2px' },
          { w: 100, h: `${width - panoSize}px`, t: '2px' },
        ];
      } else if (
        (isNonConformingRatio(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) ||
        (isPortrait(ar1) && isPanoramic(ar2) && isPanoramic(ar3))
      ) {
        itemsDimensions = [
          { w: 100, h: `${width - panoSize}px`, b: '2px' },
          { w: 50, h: panoSize_px, t: '2px', r: '2px' },
          { w: 50, h: panoSize_px, t: '2px', l: '2px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '50%', b: '2px', l: '2px' },
          { w: 100, h: '50%', t: '2px' },
        ];
      }
    } else if (size >= 4) {
      if (
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3) && isPortrait(ar4)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3) && isNonConformingRatio(ar4)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isNonConformingRatio(ar3) && isPortrait(ar4)) ||
        (isPortrait(ar1) && isNonConformingRatio(ar2) && isPortrait(ar3) && isPortrait(ar4)) ||
        (isNonConformingRatio(ar1) && isPortrait(ar2) && isPortrait(ar3) && isPortrait(ar4))
      ) {
        style.height = Math.floor(width / minimumAspectRatio);
      } else if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3) && isPanoramic(ar4)) {
        style.height = panoSize * 2;
      } else if (
        (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) ||
        (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPanoramic(ar3) && isPanoramic(ar4))
      ) {
        style.height = panoSize + (width / 2);
      } else {
        style.height = width;
      }

      //

      if (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) {
        itemsDimensions = [
          { w: 50, h: panoSize_px, b: '2px', r: '2px' },
          { w: 50, h: panoSize_px, b: '2px', l: '2px' },
          { w: 50, h: `${(width / 2)}px`, t: '2px', r: '2px' },
          { w: 50, h: `${(width / 2)}px`, t: '2px', l: '2px' },
        ];
      } else if (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPanoramic(ar3) && isPanoramic(ar4)) {
        itemsDimensions = [
          { w: 50, h: `${(width / 2)}px`, b: '2px', r: '2px' },
          { w: 50, h: `${(width / 2)}px`, b: '2px', l: '2px' },
          { w: 50, h: panoSize_px, t: '2px', r: '2px' },
          { w: 50, h: panoSize_px, t: '2px', l: '2px' },
        ];
      } else if (
        (isPortrait(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) ||
        (isPortrait(ar1) && isPanoramic(ar2) && isPanoramic(ar3) && isPanoramic(ar4))
      ) {
        itemsDimensions = [
          { w: 67, h: '100%', r: '2px' },
          { w: 33, h: '33%', b: '4px', l: '2px' },
          { w: 33, h: '33%', l: '2px' },
          { w: 33, h: '33%', t: '4px', l: '2px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '50%', b: '2px', l: '2px' },
          { w: 50, h: '50%', t: '2px', r: '2px' },
          { w: 50, h: '50%', t: '2px', l: '2px' },
        ];
      }
    }

    return ImmutableMap({
      style,
      itemsDimensions,
      size: size,
      width,
    });

  }

  getSizeData = size => {
    const { height, defaultWidth } = this.props;
    const width = this.state.width || defaultWidth;

    if (width) {
      if (size === 1) return this.getSizeDataSingle();
      if (size > 1)   return this.getSizeDataMultiple(size);
    }

    // Default
    return ImmutableMap({
      style: { height },
      itemsDimensions: [],
      size,
      width,
    });
  }

  render() {
    const { media, intl, sensitive } = this.props;
    const { visible } = this.state;
    const sizeData = this.getSizeData(media.size);
    let children, spoilerButton;

    children = media.take(4).map((attachment, i) => (
      <Item
        key={attachment.get('id')}
        onClick={this.handleClick}
        attachment={attachment}
        index={i}
        size={sizeData.get('size')}
        displayWidth={sizeData.get('width')}
        visible={visible}
        dimensions={sizeData.get('itemsDimensions')[i]}
      />
    ));

    if (visible) {
      spoilerButton = <IconButton title={intl.formatMessage(messages.toggle_visible)} icon='eye-slash' overlay onClick={this.handleOpen} />;
    } else {
      spoilerButton = (
        <button type='button' onClick={this.handleOpen} className='spoiler-button__overlay'>
          <span className='spoiler-button__overlay__label'>{sensitive ? <FormattedMessage id='status.sensitive_warning' defaultMessage='Sensitive content' /> : <FormattedMessage id='status.media_hidden' defaultMessage='Media hidden' />}</span>
        </button>
      );
    }

    return (
      <div className='media-gallery' style={sizeData.get('style')} ref={this.handleRef}>
        <div className={classNames('spoiler-button', { 'spoiler-button--minified': visible })}>
          {spoilerButton}
        </div>

        {children}
      </div>
    );
  }

}
