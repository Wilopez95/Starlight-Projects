const mustHaveWorkOrder = ({ billableServiceId, thirdPartyHaulerId }) =>
  !!(billableServiceId && !thirdPartyHaulerId);

export default mustHaveWorkOrder;
