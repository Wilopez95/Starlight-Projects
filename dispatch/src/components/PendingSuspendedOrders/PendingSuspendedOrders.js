import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Tooltip } from 'react-tippy';
import styled from 'styled-components';

import { updateSingleWorkOrder } from '@root/state/modules/workOrders';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

const Text = styled.span`
  color: black;
  text-size: 54px;
  font-size: ${(props) => (props.header ? '14px' : '25px')};
  font-weight: bold;
  text-align: center;
`;
const TextSmall = styled.span`
  color: black;
  size: 34px;
  font-weight: ${(props) => (props.bold ? 'bold' : 'normal')};
`;

const PendingSuspendedOrdersContainer = styled.div`
  background-color: white;
  z-index: 100;
  position: absolute;

  border: 1px solid black;
  padding: 10px;
  margin-right: 110px;
  margin-top: 46px;
  margin-left: -300px;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const AcceptRejectContainer = styled.span`
  margin-left: ${(props) => (props.hasAccept ? '85px' : '218px')};
  position: relative;
`;

const AcceptReject = styled.button`
  color: ${(props) => (props.accept ? '#e87900' : 'white')};
  background-color: ${(props) => (props.accept ? 'transparent' : '#e87900')};
  border: #e87900 1px solid;
  size: 34px;
  font-weight: bold;
  display: inline-block;
  padding-right: 12px;
  padding-top: 4px;
  padding-bottom: 4px;
  margin-right: 5px;
  position: relative;
  cursor: pointer;
`;

const XText = styled.span`
  font-weight: bold;
`;

const WrapText = styled.span`
  display: flex;
  flex-direction: wrap;
`;

const DriverInfo = styled.div`
  padding-right: 12px;
  padding-bottom: 12px;
`;

const WorkorderHeaderInfo = styled.div`
  padding-top: 20px;
  margin-top: 5px;
`;

const WorkorderContainer = styled.div`
  border-bottom: 1px solid black;
  padding-bottom: 20px;
  padding-right: 5px;
  width: 380px;
  z-index: 98;
`;

const HighPriority = styled.span`
  color: black;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
  padding-bottom: 0;
  padding-top: -12px;
  margin-top: 12px;
  margin-right: 33px;
  float: right;
  position: relative;
`;

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

class PendingSuspendedOrders extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    workOrders: PropTypes.array.isRequired,
    history: History,
    match: PropTypes.object,
  };

  revokeRequest = (workOrderId) => {
    const { dispatch } = this.props;
    const payload = {
      id: workOrderId,
      suspendRequested: 0,
    };

    dispatch(updateSingleWorkOrder(payload));
  };

  revokeRequestDispatch = (workOrderId) => {
    const { dispatch } = this.props;
    const payload = {
      id: workOrderId,
      pendingSuspend: false,
    };

    dispatch(updateSingleWorkOrder(payload));
  };

  approveRequest = (workOrder) => {
    this.props.history.push(
      pathToUrl(`${Paths.Dispatcher}/suspend/:woaction/:step/:driverId/:workOrderId`, {
        businessUnit: this.props.match.params.businessUnit,
        woaction: encodeURIComponent(workOrder.action),
        step: encodeURIComponent(workOrder.step === null ? 'workorder' : workOrder.step),
        driverId: workOrder.driver?.id ? workOrder.driver.id : 'nodriver',
        workOrderId: workOrder.id,
      }),
    );
  };

  render() {
    const hasRequestedSuspendedOrder = this.props.workOrders.map(
      (workorder) => workorder.suspendRequested,
    );
    const hasPendingSuspendedOrder = this.props.workOrders.map(
      (workorder) => workorder.pendingSuspend,
    );
    return (
      <PendingSuspendedOrdersContainer>
        {hasRequestedSuspendedOrder.includes(true) === true ? (
          <Text header>
            Drivers have requested to suspend orders{" "}
            <Tooltip
              title=" You can only approve of an order when a driver is on finish service
          step, we will then direct you to provide a suspend
          location to finish approving. Once the order has been placed in suspension by providing a location it will be removed from this list.
           Revoked workorders will be removed immediately and there will be no change for the driver."
              position="top"
              trigger="click"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
            <br />
          </Text>
        ) : null}
        {this.props.workOrders.map(
          (workorder) =>
            workorder.suspendRequested && (
              <WorkorderContainer key={workorder.id}>
                {workorder.priority ? (
                  <HighPriority> &nbsp; &#x26A0;</HighPriority>
                ) : null}
                <WorkorderHeaderInfo>
                  <Link
                    to={pathToUrl(`${Paths.WorkOrdersEdit}`, {
                      businessUnit: this.props.match.params.businessUnit,
                      id: workorder.id,
                    })}
                    className="btn btn__link"
                  >
                    <TextSmall bold>
                      #{workorder.id} &nbsp;{workorder.action} &nbsp; &nbsp;{" "}
                      <span
                        className="labelOrderStatus"
                        key={
                          workorder.id +
                          workorder.step +
                          workorder.driver.description
                        }
                      >
                        {workorder.step === null
                          ? "NOT STARTED"
                          : workorder.step}
                      </span>
                    </TextSmall>
                  </Link>
                </WorkorderHeaderInfo>
                <WrapText key={workorder.id}>
                  <DriverInfo key={workorder.id + workorder.id}>
                    {workorder?.driver?.name ? (
                      <TextSmall>
                        Driver &nbsp;
                        {workorder.driver.description}
                      </TextSmall>
                    ) : (
                      <TextSmall>No Driver Assigned</TextSmall>
                    )}
                    <br />
                    <TextSmall> {workorder.location1.name}</TextSmall>
                  </DriverInfo>
                </WrapText>
                {workorder.step === "FINISH SERVICE" ? (
                  <AcceptRejectContainer
                    hasAccept
                    key={workorder.id + workorder.step}
                  >
                    <AcceptReject
                      accept
                      onClick={() => this.approveRequest(workorder)}
                    >
                      {" "}
                      &#10004; Accept Request
                    </AcceptReject>
                    <AcceptReject
                      onClick={() => this.revokeRequest(workorder.id)}
                    >
                      <XText>X </XText> Revoke Request
                    </AcceptReject>
                  </AcceptRejectContainer>
                ) : (
                  <AcceptRejectContainer>
                    <AcceptReject
                      onClick={() => this.revokeRequest(workorder.id)}
                    >
                      <XText>X </XText> Revoke Request
                    </AcceptReject>
                  </AcceptRejectContainer>
                )}
              </WorkorderContainer>
            )
        )}
        <br />
        {hasPendingSuspendedOrder.includes(true) === true ? (
          <Text header>
            Orders placed in pending suspension{" "}
            <Tooltip
              title=" These are orders that have been placed in pending suspension through dispatch.
              You can approve of them here to place a suspend location or delete them by revoking them."
              position="top"
              trigger="click"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
            <br />
          </Text>
        ) : null}
        {this.props.workOrders.map(
          (workorder) =>
            workorder.pendingSuspend && (
              <WorkorderContainer key={workorder.id}>
                {workorder.priority ? (
                  <HighPriority> &nbsp; &#x26A0;</HighPriority>
                ) : null}
                <WorkorderHeaderInfo>
                  <Link to={Paths.WorkOrdersEdit} className="btn btn__link">
                    <TextSmall
                      bold
                      key={workorder.id + workorder.pendingSuspend}
                    >
                      #{workorder.id} &nbsp;{workorder.action} &nbsp; &nbsp;{" "}
                      <span
                        className="labelOrderStatus"
                        key={
                          workorder.id +
                          workorder.step +
                          workorder.driver.description
                        }
                      >
                        {workorder.step === null
                          ? "NOT STARTED"
                          : workorder.step}
                      </span>
                    </TextSmall>
                  </Link>
                </WorkorderHeaderInfo>
                <WrapText key={workorder.id}>
                  <DriverInfo key={workorder.id + workorder.id}>
                    {workorder?.driver?.name ? (
                      <TextSmall>
                        Driver &nbsp;
                        {workorder.driver.description}
                      </TextSmall>
                    ) : (
                      <TextSmall>No Driver Assigned</TextSmall>
                    )}
                    <br />
                    <TextSmall> {workorder.location1.name}</TextSmall>
                  </DriverInfo>
                </WrapText>
                {workorder.step === "FINISH SERVICE" ? (
                  <AcceptRejectContainer
                    hasAccept
                    key={workorder.id + workorder.step}
                  >
                    <AcceptReject
                      accept
                      onClick={() => this.approveRequest(workorder)}
                      key={`accept${1}`}
                    >
                      {" "}
                      &#10004; Accept Request
                    </AcceptReject>
                    <AcceptReject
                      onClick={() => this.revokeRequestDispatch(workorder.id)}
                      key={`revoke${1}`}
                    >
                      <XText>X </XText> Revoke Request
                    </AcceptReject>
                  </AcceptRejectContainer>
                ) : (
                  <AcceptRejectContainer>
                    <AcceptReject
                      onClick={() => this.revokeRequestDispatch(workorder.id)}
                      key={`accept${1}`}
                    >
                      <XText>X </XText> Revoke Request
                    </AcceptReject>
                  </AcceptRejectContainer>
                )}
              </WorkorderContainer>
            )
        )}
      </PendingSuspendedOrdersContainer>
    );
  }
}

export default withRouter(connect()(PendingSuspendedOrders));
