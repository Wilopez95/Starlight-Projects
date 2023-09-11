/* eslint-disable react/prop-types */
/* eslint-disable complexity */

import cx from 'classnames';
import WorkOrderHistoryTime from './WorkOrderHistoryTime';
import WorkOrderHistoryDate from './WorkOrderHistoryDate';

// type Props = {
//   data: Object,
//   notesStates: Object,
//   timezone: string,
// };

const WorkOrderHistoryNote = (props) => {
  const {
    data,
    data: { note, location },
    notesStates,
    timezone,
  } = props;

  const isTransition = data.type === notesStates.TRANSITION;
  const title = isTransition ? data.note.newState : data.type;

  const noteClassNameByType = {
    [notesStates.NOTE]: 'note--default',
    [notesStates.MANIFEST]: 'note--manifest',
    [notesStates.SCALETICKET]: 'note--scaleTickets',
    [notesStates.TRANSITION]: 'note--transition',
    WEIGHT_RECORD: 'note--weight',
  };

  return (
    <div className={cx('note', noteClassNameByType[data.type])}>
      <div className="note-column note-column--date">
        {data.createdDate ? <WorkOrderHistoryDate createdDate={data.createdDate} /> : null}
        {data.createdDate ? (
          <WorkOrderHistoryTime createdDate={data.createdDate} timezone={timezone} />
        ) : null}
      </div>
      <div className="note-column note-column--author">
        {data.createdBy ? <p>{data.createdBy}</p> : null}
      </div>
      <div className="note-column note-column--title">
        <p>{title ? String(title).replace(/_/g, ' ') : 'TRANSITION'}</p>
      </div>
      <div className="note-column note-column--details">
        <ul className="details-list">
          {note.text ||
          note.weight ||
          note.quantity ||
          note.picture ||
          note.document ||
          location.name ||
          location.waypointName ||
          (location.location && location.location.lat) ? (
            <li className="details-item">
              {note.text ? <p>{note.text}</p> : null}
              {note.weight ? (
                <p>
                  Weight: {note.weight} {note.unittype ? <span>{note.unittype}</span> : null}
                </p>
              ) : null}
              {note.quantity ? (
                <p>
                  {note.quantity} {note.unittype ? <span>{note.unittype}</span> : 'UNITS'}
                </p>
              ) : null}
              {note.picture ? (
                <p>
                  File Attached:{' '}
                  <a href={note.picture} rel="noopener noreferrer" target="_blank">
                    Link
                  </a>
                </p>
              ) : null}
              {note.document ? (
                <p>
                  Signed Document:{' '}
                  <a href={note.document} rel="noopener noreferrer" target="_blank">
                    Link
                  </a>
                </p>
              ) : null}
              <p>
                {/^GPS_/.test(location.name)
                  ? `Lat: ${location.location.lat} Long: ${location.location.lon}`
                  : location.waypointName || location.name}
              </p>
            </li>
          ) : null}
          {data.can && data.can.name ? (
            <li className="details-item">
              <p>
                <b>CAN:</b> {data.can.name}
              </p>
            </li>
          ) : null}
          {note.manifestNumber || note.profileNumber || note.ticketNumber ? (
            <li className="details-item details-item--numbers">
              {note.manifestNumber ? <p>MANIFEST: #{note.manifestNumber}</p> : null}
              {note.profileNumber ? <p>PROFILE: #{note.profileNumber}</p> : null}
              {note.ticketNumber ? <p>Ticket: #{note.ticketNumber}</p> : null}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};

WorkOrderHistoryNote.defaultProps = {
  timezone: 'America/Denver',
};

export default WorkOrderHistoryNote;
