/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { Component } from 'react';
import { Tooltip } from 'react-tippy';
import { fetchWOserviceDisposalSites } from '@root/state/modules/services/actions';
import { fetchWorkOrder } from '@root/state/modules/workOrders';

// type Props = {
//   errors: Object,
//   Field: Component,
//   values: Object,
//   billableService: Object,
//   setFieldValue: Function,
//   transformCoreActionToDispatch: Function,
//   onTypeChange: Function,
//   dispatch: Function,
//   workOrderId: string,
//   toolTips: Element,
//   disabled: Boolean,
//   services: Array,
//   setLocation2Field: Function,
//   setValueInState: Function,
// };

export default class ServiceField extends Component {
  componentDidMount() {
    const {
      dispatch,
      workOrderId,
      setFieldValue,
      billableService: { currentService },
    } = this.props;

    setFieldValue('service', currentService);
    dispatch(fetchWOserviceDisposalSites(workOrderId));
    dispatch(fetchWorkOrder(workOrderId, true));
  }

  render() {
    const {
      errors,
      Field,
      toolTips,
      values,
      services,
      setFieldValue,
      onTypeChange,
      transformCoreActionToDispatch,
      disabled,
      setLocation2Field,
      setValueInState,
    } = this.props;

    return (
      <div
        className="form-col"
        style={{
          marginBottom: '19px',
        }}
      >
        <div className="tooltip-container">
          <label className="form-label">Service *</label>
          <Tooltip
            title="The list of available services to apply - synchronized with the Core system."
            position="top"
            trigger="click"
          >
            <i className="far fa-info-circle fa-xs" style={toolTips} />
          </Tooltip>
        </div>
        <Field
          disabled={disabled}
          name="service"
          component="select"
          value={values.service}
          className={errors.service ? 'text-input error-required' : 'text-input'}
          onChange={(event) => {
            setFieldValue('service', event.target.value);
            setFieldValue('serviceDescription', event.target.value);

            const index = event.target.selectedIndex;
            const optionElement = event.target.childNodes[index];
            const optionAction = optionElement.getAttribute('action');
            const optionCanSize = optionElement.getAttribute('cansize');
            const optionHaulingBillableServiceId = optionElement.getAttribute('id');

            const selected = transformCoreActionToDispatch(optionAction);

            setValueInState(selected);
            setFieldValue('action', selected);
            setFieldValue('size', optionCanSize);
            setFieldValue('haulingBillableServiceId', +optionHaulingBillableServiceId);
            onTypeChange(selected);
            setLocation2Field(selected);
          }}
        >
          <>
            <option hidden disabled key="" value="">
              Select service
            </option>
            {services.map((action) => (
              <option
                key={action.value}
                value={action.value}
                action={action.action}
                cansize={action.cansize}
                id={action.id}
              >
                {action.label}
              </option>
            ))}
          </>
        </Field>
      </div>
    );
  }
}
