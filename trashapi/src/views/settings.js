const settingsView = obj => {
  obj.value = JSON.parse(obj.value);
  const buId = obj.businessUnitId ?? obj.haulingBusinessUnitId;
  obj.businessUnitId = buId;
  obj.haulingBusinessUnitId = buId;
  delete obj.id;
  return obj;
};

// :: Object -> Object
// settingsView({
//   id: 1,
//   value: '{"text": "some text"}'
// })
// > {
//   value: {
//     text: 'some text'
//   }
// }
export default settingsView;
