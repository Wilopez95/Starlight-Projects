import { stateNames } from './stateNames';

/**
 * @function convertLocationFormat
 * @descript Converts the mapbox format of an address: Address, City, State ZIP,
 * United States of America to one without USA and an abbreviated state
 * with a comma before the zipcode.
 * @param {String} address - the address string containing: address, city, state zip, united states of america
 * @returns {String} formattedAddress - correctly formatted for the database
 */
export function convertLocationFormat(address) {
  // TODO Actually figure out the abbreviations sent by core for non-USA addresses and handle those correctly
  if (!address.includes('United States of America')) {
    return address;
  }

  const addressArray = address.split(',');
  let formattedAddress;
  if (addressArray.length === 4) {
    const stateZip = addressArray[2].trim().split(' ');
    if (stateZip.length === 2) {
      formattedAddress = `${addressArray[0]},${addressArray[1]}, ${stateNames[stateZip[0]]}, ${
        stateZip[1]
      }`;
    } else {
      formattedAddress = `${addressArray[0]},${addressArray[1]}, ${
        stateNames[`${stateZip[0]} ${stateZip[1]}`]
      }, ${stateZip[2]}`;
    }
  } else if (addressArray.length === 5) {
    const stateZip = addressArray[3].trim().split(' ');
    if (stateZip.length === 2) {
      formattedAddress = `${addressArray[0]},${addressArray[1]},${addressArray[2]}, ${
        stateNames[stateZip[0]]
      }, ${stateZip[1]}`;
    } else {
      formattedAddress = `${addressArray[0]},${addressArray[1]},${addressArray[2]}, ${
        stateNames[`${stateZip[0]} ${stateZip[1]}`]
      }, ${stateZip[2]}`;
    }
  } else {
    formattedAddress = '';
  }

  return formattedAddress;
}
