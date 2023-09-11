/* eslint-disable  camelcase */
import { memo, PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class DataList extends PureComponent {
  static propTypes = {
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  };

  static defaultProps = {
    loading: false,
    disabled: false,
    className: '',
    children: [],
  };

  renderEmptyState() {
    return <div className="datalist-empty">No items provisioned</div>;
  }

  renderLoadingState() {
    return <div className="datalist-loading">We are loading items...</div>;
  }

  render() {
    const classes = classNames('datalist', this.props.className, {
      'is-disable': this.props.disabled,
      'is-loading': this.props.loading,
    });
    return (
      <div className={classes}>
        <div ref={(it) => (this.content = it)} className="datalist-content">
          {this.props.children.length === 0 && !this.props.loading ? this.renderEmptyState() : null}
          {this.props.loading ? this.renderLoadingState() : null}
          <div className="datalist-cans">{this.props.children}</div>
        </div>
        <div className="datalist-backdrop" />
      </div>
    );
  }
}

export default memo(DataList);
