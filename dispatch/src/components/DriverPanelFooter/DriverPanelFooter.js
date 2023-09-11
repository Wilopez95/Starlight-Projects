/* eslint-disable react/prop-types */

/* eslint-disable max-lines, array-callback-return, max-depth */
import { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faShareSquare } from '@fortawesome/pro-regular-svg-icons';
import ReactToPrint from 'react-to-print';

// type Props = {
//   onClickPublish: () => void,
//   workOrders: Array<WorkOrderType>,
//   allOrders: React.Ref<*>,
//   disablePublish: boolean,
// };

const PrintListTrigger = (
  <div className="dpanel-footer-btns__item">
    <button className="dpanel-footer-btn" type="button">
      <FontAwesomeIcon icon={faPrint} className="dpanel-footer-btns__icon" />
      PRINT LIST
    </button>
  </div>
);

function DriverPanelFooter({ onClickPublish, workOrders, allOrders, disablePublish }) {
  const handleClick = useCallback(onClickPublish, [onClickPublish]);
  return (
    <div className="dpanel-footer-btns">
      {workOrders && !!workOrders.length ? (
        <ReactToPrint trigger={() => PrintListTrigger} content={() => allOrders} />
      ) : (
        <ReactToPrint trigger={() => PrintListTrigger} content={() => null} />
      )}
      <div className="dpanel-footer-btns__item">
        <button
          className="dpanel-footer-btn"
          type="button"
          onClick={handleClick}
          disabled={disablePublish}
        >
          <FontAwesomeIcon icon={faShareSquare} className="dpanel-footer-btns__icon" />
          PUBLISH
        </button>
      </div>
    </div>
  );
}

export default DriverPanelFooter;
