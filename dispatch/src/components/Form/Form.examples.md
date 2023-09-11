#### All together

```jsx
const onSubmit = data => alert(JSON.stringify(data));
const favoriteColorOptions = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
  { value: 'blue', label: 'Blue', color: '#0052CC', disabled: true },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

const getSchema = () => {
  return yup.object().shape({
    salutation: yup.string(),
    name: yup.string().required('Name is required'),
    email: yup.string().email('Wrong format').required('Email is required'),

    favoriteColor: yup.string().nullable(),
    driverLicense: yup.boolean(),
    pets: yup.boolean(),

    additionalInfo: yup.string(),
    termsAndConitions: yup.boolean(),
  });
};

<Formik
  initialValues={{
    salutation: 'Mr',
    name: '',
    email: '',
    favoriteColor: 'blue',
    driverLicense: false,
    pets: false,
    age: '',
    birthday: '',
    additionalInfo: '',
    termsAndConitions: false,
  }}
  validationSchema={getSchema}
  onSubmit={onSubmit}
  render={({
    values,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    isSubmitting,
    setFieldTouched,
    errors,
    handleReset,
  }) => {
    return (
      <Form>
        <fieldset>
          <legend>Complete Form Example</legend>

          <Radio
            name="salutation"
            label="Salutation"
            options={[
              { value: 'Mr', label: 'Mr.' },
              { value: 'Mrs', label: 'Mrs.' },
              { value: 'Ms', label: 'Ms.' },
            ]}
          />

          <Input name="name" label="Name" required />

          <Input
            name="email"
            label="Enter your Email"
            placeholder="foo@bar.com"
            required
          />

          <Datepicker
            name="birthday"
            label="Birthday"
            dateFormat="yyyy-MM-dd"
            placeholder="yyyy-MM-dd"
            hint="Please enter your birth date"
          />

          <Select
            name="favoriteColor"
            label="Favorite Color"
            setFieldValue={setFieldValue}
            touched={touched}
            value="favoriteColor"
            errors={errors}
            values={values}
            setFieldTouched={setFieldTouched}
            placeholder="Select an Option"
            options={favoriteColorOptions}
          />

          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              {`Do you have a drivers license ? ${
                values.driverLicense ? 'Yes' : 'No'
              }`}
            </div>
            <Toggle name="driverLicense" />
          </div>

          <Textarea
            name="additionalInfo"
            label="Aditional information"
            hint="this is optional"
          />

          <Checkbox
            name="termsAndConitions"
            label="Terms and Conditions"
            text="Click to accept the terms and conditions"
          />

          <SubmitBtn disabled={!values.termsAndConitions} />
          <Button onClick={() => alert('Cancel')}>Cancel</Button>
        </fieldset>
      </Form>
    );
  }}
/>;
```
