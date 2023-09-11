/* eslint-disable react/prop-types */
import { Component } from 'react';
import { Tooltip } from 'react-tippy';
import { fetchWOServices } from '@root/state/modules/services/actions';
import ServiceField from './ServiceField';
import locationFields from './locationFieldsObj';

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

// type Props = {
//   errors: Object,

//   Field: Component,
//   values: Object,
//   billableService: Object,
//   sizes: Array,
//   materials: Array,
//   templates: Array,
//   setValueInState: Function,
//   serviceMaterials: Array,
//   setFieldValue: Function,
//   workOrder: Object,
//   actions: Array,
//   transformCoreActionToDispatch: Function,
//   onTypeChange: Function,
//   dispatch: Function,
//   match: Object,
//   isWOfromCore: Boolean,
//   disabled: Boolean,
//   serviceCoreMaterialsId: Number,
//   currentServiceMaterials: String,
//   setLocation2: Function,
// };

export default class SecondInfoBlock extends Component {
  componentDidMount() {
    const { dispatch, match, serviceCoreMaterialsId } = this.props;

    dispatch(fetchWOServices(match.params.workOrderId, serviceCoreMaterialsId));
  }

  componentDidUpdate(prevPros) {
    if (prevPros.currentServiceMaterials !== this.props.currentServiceMaterials) {
      this.props.setFieldValue('material', this.props.currentServiceMaterials);
    }
  }

  setLocation2Field = (value) => {
    if (locationFields[value]?.location2.disabled) {
      this.props.setLocation2({ lon: null, lat: null }, true, false);
    }
  };

  render() {
    const {
      Field,
      values,
      materials,
      templates,
      setValueInState,
      serviceMaterials,
      setFieldValue,
      dispatch,
      match,
      errors,
      isWOfromCore,
      transformCoreActionToDispatch,
      onTypeChange,
      disabled,
      billableService,
      workOrder,
    } = this.props;
    let { sizes } = this.props;
    if (values.size && !sizes.some(({ value }) => value === values.size)) {
      sizes = [...sizes, { label: values.size, value: values.size }];
    }

    let actionTypes = [];
    if (isWOfromCore) {
      actionTypes = this.props.actions.map((act) => ({
        value: act.value,
        label: act.label === 'SPOT' ? 'DELIVERY' : act.label,
      }));
    } else {
      actionTypes = this.props.actions.map((act) => ({
        value: act.value,
        label: act.label === 'SPOT' ? 'DELIVERY' : act.label,
      }));
    }

    // leave suspend types in for a suspended order, resume types in for a resume
    // remove from a normal workorder to elminate changing type to a suspended here
    let filteredActions;
    if (this.props.workOrder.action.includes('SUSPEND')) {
      filteredActions = actionTypes.filter((at) => at.label === this.props.workOrder.action);
    } else if (this.props.workOrder.action.includes('RESUME')) {
      filteredActions = actionTypes.filter((at) => at.label === this.props.workOrder.action);
    } else {
      filteredActions = actionTypes
        .filter((at) => !at.label.includes('SUSPEND'))
        .filter((at) => !at.label.includes('RESUME'));
    }

    let services = [...billableService.services];
    const { haulingBillableServiceId, haulingMaterialId, serviceDescription, size, action } =
      workOrder;

    if (
      !services.some(({ value }) => value === serviceDescription) &&
      values.haulingMaterialId === haulingMaterialId
    ) {
      services = [
        ...services,
        {
          action: action === 'SPOT' ? 'delivery' : action,
          label: serviceDescription,
          value: serviceDescription,
          cansize: size,
          id: haulingBillableServiceId,
        },
      ];
    }

    const materialsTypes =
      serviceMaterials.materials.length > 0 ? serviceMaterials.materials : materials;
    return (
      <div className="form-group" style={{ flexWrap: 'wrap', display: 'flex' }}>
        <div
          className="form-col"
          style={{
            marginBottom: '19px',
          }}
        >
          <div className="tooltip-container">
            <label className="form-label">Client Name</label>
            <Tooltip
              title="What is the name of the person placing the order?"
              position="top"
              trigger="click"
              // hideOnClick="true"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
          </div>
          <Field disabled={disabled} name="contactName" type="text" className="text-input" />
        </div>
        <div
          className="form-col"
          style={{
            marginBottom: '19px',
          }}
        >
          <div className="tooltip-container">
            <label className="form-label">Client Phone</label>
            <Tooltip
              title="What is the phone number of the person placing the order?"
              position="top"
              trigger="click"
              // hideOnClick="true"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
          </div>
          <Field disabled={disabled} name="contactNumber" type="text" className="text-input" />
        </div>
        <div
          className="form-col"
          style={{
            marginBottom: '19px',
          }}
        >
          <div className="tooltip-container">
            <label className="form-label">Client Company Name</label>
            <Tooltip
              title="What is the name of the company this person works for?"
              position="top"
              trigger="click"
              // hideOnClick="true"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
          </div>
          <Field disabled={disabled} name="customerName" type="text" className="text-input" />
        </div>
        {isWOfromCore ? (
          <ServiceField
            disabled={disabled}
            transformCoreActionToDispatch={transformCoreActionToDispatch}
            onTypeChange={onTypeChange}
            setFieldValue={setFieldValue}
            values={values}
            toolTips={toolTips}
            errors={errors}
            Field={Field}
            billableService={this.props.billableService}
            services={services}
            dispatch={dispatch}
            workOrderId={match.params.workOrderId}
            setLocation2Field={this.setLocation2Field}
            setValueInState={setValueInState}
          />
        ) : null}
        <div
          className="form-col"
          style={{
            marginBottom: '19px',
          }}
        >
          <div className="tooltip-container">
            <label className="form-label">Type *</label>
            <Tooltip
              title="What kind of service is this person asking for? Delivery, Final, Switch… etc."
              position="top"
              trigger="click"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
          </div>
          <Field
            name="action"
            component="select"
            value={values.action}
            className="text-input"
            disabled={isWOfromCore || disabled}
            onChange={(e) => {
              setFieldValue('action', e.target.value);
              setValueInState(e.target.value);
              onTypeChange(e.target.value);
              this.setLocation2Field(e.target.value);
            }}
          >
            <>
              <option hidden disabled key="" value="">
                Select type
              </option>
              {filteredActions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </>
          </Field>
        </div>
        <div
          className="form-col"
          style={{
            marginBottom: '19px',
          }}
        >
          <div className="tooltip-container">
            <label className="form-label">Can Size *</label>
            <Tooltip
              title="What size of canister does the customer want?"
              position="top"
              trigger="click"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
          </div>
          <Field
            name="size"
            component="select"
            className="text-input"
            value={values.size}
            disabled={isWOfromCore || disabled}
          >
            <option hidden disabled key="" value="">
              Select size
            </option>
            {sizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.value}
              </option>
            ))}
          </Field>
        </div>
        {/* <div className="form-col" /> */}

        <div
          className="form-col"
          style={{
            marginBottom: '19px',
          }}
        >
          <label className="form-label">Material *</label>
          <Field
            disabled={disabled}
            onChange={(event) => {
              const index = event.target.selectedIndex;
              const optionElement = event.target.childNodes[index];
              const optionElementId = optionElement.getAttribute('id');
              if (isWOfromCore) {
                dispatch(fetchWOServices(match.params.workOrderId, optionElementId));
              }
              setFieldValue('material', event.target.value);
              setFieldValue('service', '');
              if (isWOfromCore) {
                setFieldValue('size', '');
                setFieldValue('action', '');
              }
              setFieldValue('haulingMaterialId', +optionElementId);
            }}
            name="material"
            component="select"
            className="text-input"
            // value={this.props.currentServiceMaterials}
          >
            {materialsTypes.map((material) => (
              <option key={material.value} value={material.value} id={material.id}>
                {material.value}
              </option>
            ))}
          </Field>
        </div>

        <div
          className="form-col"
          style={{
            marginBottom: '19px',
          }}
        >
          <div className="tooltip-container">
            <label className="form-label">Template</label>
            <Tooltip
              title="What logo and style of documentation did you want to use for this order? "
              position="top"
              trigger="click"
            >
              <i className="far fa-info-circle fa-xs" style={toolTips} />
            </Tooltip>
          </div>
          <Field disabled={disabled} name="templateId" component="select" className="text-input">
            {templates.map((template) => (
              <option key={template.name} value={template.id}>
                {template.name}
              </option>
            ))}
          </Field>
        </div>
        <div
          className="form-col"
          style={{
            // marginBottom: '19px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="checkbox-container">
            <Field
              disabled={disabled}
              name="signatureRequired"
              render={({ field }) => (
                <input
                  disabled={disabled}
                  {...field}
                  type="checkbox"
                  className="checkbox"
                  checked={values.signatureRequired}
                />
              )}
            />
            <label>Signature Required</label>
          </div>
        </div>
      </div>
    );
  }
}
