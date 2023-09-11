const axios = require('axios');

const data = JSON.stringify({
  location: {
    lat: 37.74222453,
    lon: -104.972373513,
  },
  name: `GPS_${new Date().getTime()}`,
  type: 'TRUCK',
});

const deliverySteps = [
  'START WORK ORDER',
  'ARRIVE ON SITE',
  'START SERVICE',
  'DROP CAN', //3
  'FINISH SERVICE', //4
  'WORK ORDER COMPLETE', //5
];

const finalSteps = [
  'START WORK ORDER', // 0
  'ARRIVE ON SITE', // 1
  'START SERVICE', // 2
  'SIGNATURE', // 3
  'PICKUP CAN', // 4
  'FINISH SERVICE', // 5
  'GOING TO FILL', // 6
  'ARRIVE AT FILL', // 7
  'FINISH DISPOSAL', // 8
  'RECORD WEIGHT TICKETS', // 9
  'RECORD MANIFESTS', // 10
  'WORK ORDER COMPLETE', // 11
];

function getConfig(woId, step, data, canId) {
  const theUrl = canId
    ? `http://localhost:3006/trashapi/v1/workorders/${woId}/transition/${encodeURIComponent(step)}?canId=${canId}`
    : `http://localhost:3006/trashapi/v1/workorders/${woId}/transition/${encodeURIComponent(step)}`;
  return {
    method: 'post',
    url: theUrl,
    headers: {
      Authorization: 'Bearer AVZIbqQeUo8lXYSBDjr6C',
      'User-Agent': 'starlight-drivers/1.0.2/ios',
      'Content-Type': 'application/json',
    },
    data,
  };
}

const currentStep =11

axios(getConfig(36, finalSteps[currentStep], data))
  .then(response => {
    console.log(JSON.stringify(response.data));
  })
  .catch(error => {
    console.log(error);
  });
