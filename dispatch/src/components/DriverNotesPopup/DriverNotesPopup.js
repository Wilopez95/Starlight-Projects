/* eslint-disable jsx-a11y/anchor-is-valid */
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import Popup from 'reactjs-popup';

const DriverNotesPopup = ({ workOrder, id, workOrderNotes }) =>
  workOrderNotes.list.length > 0 || workOrder.instructions !== null ? (
    <table className="dnotes-popup-table" id={id}>
      <thead>
        <tr className="dnotes-popup-table__header-row">
          <th>
            <p
              className="closeDriverInfowindow"
              onClick={() => {
                const element = document.getElementById('driverNotesPopup');
                ReactDOM.unmountComponentAtNode(element);
              }}
            >
              X
            </p>
            <h3>Driver Notes</h3>
            <p>{workOrder.location1.name}</p>
            <p>
              <span className="bold"> WO # {workOrder.id} </span> &nbsp;{' '}
              {workOrder.driver.description}
              &nbsp;
            </p>
          </th>
        </tr>
      </thead>
      <tbody className="driver-notes-table-body">
        {workOrderNotes.list.map((item) => (
          <tr key={item.id}>
            <th>
              <div style={{ display: 'flex' }}>
                {item.note.picture !== 'null' ||
                /\.(gif|jpg|jpeg|tiff|png)$/i.test(item.note.picture) === true ? (
                  <Popup
                    trigger={
                      <img
                        id="driverNotesImg"
                        src={
                          item.note.picture ||
                          'https://cdn.starlightpro.com/img/no-img-available.png'
                        }
                        alt="Driver Note Image"
                        className="dnotes-modal__thumbnail"
                      />
                    }
                    modal
                  >
                    {(close) => (
                      <div className="dnotes-modal">
                        <a className="close" onClick={close}>
                          &times;
                        </a>
                        <div className="content">
                          <img
                            src={
                              item.note.picture ||
                              'https://cdn.starlightpro.com/img/no-img-available.png'
                            }
                            alt="Driver Note Image"
                          />
                        </div>
                      </div>
                    )}
                  </Popup>
                ) : (
                  <img
                    id="driverNotesImg"
                    src="https://cdn.starlightpro.com/img/no-img-available.png"
                    alt="Driver Note Image"
                    className="dnotes-modal__thumbnail"
                  />
                )}
                <p
                  style={{
                    width: '150px',
                    maxWidth: '150px',
                    minWidth: '150px',
                    paddingRight: '1.2em',
                    postion: 'fixed',
                  }}
                >
                  {moment(item.createdDate).format('llll')}
                  <br />
                </p>
                <p>
                  <span
                    className="badge badge-secondary"
                    style={{
                      width: '80px',
                      paddingRight: '0.4em',
                      marginRight: '2px',
                    }}
                  >
                    Driver
                  </span>
                </p>
                {/* TODO: dynamically make the color based upon the type as 'badges' for easier visiblity of type of note (action versus driver note) */}
                <p
                  id={item.id}
                  className="crop textp"
                  style={{ marginRight: '30px', paddingRight: '8px' }}
                >
                  {' '}
                  {(item.note && item.note.text) || 'No text given'}{' '}
                </p>
              </div>
            </th>
          </tr>
        ))}
        <tr key={workOrder.id}>
          {/* work order notes called for accessing contractor info */}
          <td style={{ display: 'flex', marginTop: '13px' }}>
            <img
              id="driverNotesImg"
              src="https://cdn.starlightpro.com/img/no-img-available.png"
              alt="Contractor Pic"
              style={{
                width: '100%',
                maxWidth: '100px',
                maxHeight: '100px',
                paddingRight: '10px',
                marginLeft: '9px',
              }}
            />

            <p
              style={{
                width: '150px',
                maxWidth: '150px',
                minWidth: '150px',
                paddingRight: '1.2em',
                postion: 'fixed',
              }}
            >
              {moment(workOrder.createdDate).format('llll')}
              <br />
            </p>
            <p>
              <span
                className="badge badge-secondary"
                style={{
                  width: '90px',
                  postion: 'absolute',
                }}
              >
                {workOrder.haulingBillableServiceId === null ? 'Contractor' : 'CSR'}
              </span>
            </p>
            <div className="cropContractor">
              <p id={`contractor${workOrder.id}`}>{workOrder.instructions || 'No text given '} </p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  ) : (
    <table
      style={{
        zIndex: '99 !important',
        minWidth: '650px !important',
        maxWidth: '650px !important',
      }}
      className="dnotes-popup-table"
      id={id}
    >
      <thead>
        <tr
          style={{
            backgroundColor: '#434343',
            color: 'white',
            fontSize: '20px',
          }}
        >
          <th>
            <p
              className="closeDriverInfowindow"
              onClick={() => {
                const element = document.getElementById('driverNotesPopup');
                ReactDOM.unmountComponentAtNode(element);
              }}
            >
              X
            </p>
            <h3>Driver Notes</h3>
            <p>{workOrder.location1.description || workOrder.location1.name}</p>
            <p>
              <span className="bold"> WO # {workOrder.id} </span> &nbsp;{' '}
              {workOrder.driver.description}
              &nbsp;
            </p>
          </th>
        </tr>
      </thead>
      <tbody style={{ overflowY: '' }}>
        <tr key={workOrder.id} style={{ borderBottom: 'none' }}>
          <td
            style={{
              width: '100%',
              paddingTop: '4em',
              borderRadius: '10px',
              marginRight: '4rem',
              paddingLeft: '8.5rem',
            }}
          >
            There are no notes currently for this workorder{'  '}
          </td>
        </tr>
      </tbody>
    </table>
  );

DriverNotesPopup.propTypes = {
  workOrder: PropTypes.object,
  workOrderNotes: PropTypes.object,
  id: PropTypes.number.isRequired,
};

export default DriverNotesPopup;
