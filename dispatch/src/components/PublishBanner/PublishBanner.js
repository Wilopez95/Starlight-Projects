/* eslint-disable react/prop-types */

const PublishBanner = (props) => {
  const handleClick = () => {
    props.onClickBanner();
  };
  return (
    <div
      className="notificationPanel"
      style={{
        display: props.showingBanner ? 'flex' : 'none',
      }}
    >
      <div className="notificationPanelInner">
        Hi there! You have {props.unpublishedChanges} unpublished changes.
      </div>
      <div className="notificationPanelInner">
        To apply changes please press Publish button, otherwise all changes will be lost
      </div>
      <span className="notificationPanel-closeBtn" onClick={handleClick}>
        <i className="far fa-times-circle fa-2x" />
      </span>
    </div>
  );
};

export default PublishBanner;
