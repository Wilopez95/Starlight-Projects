import ApiError from '../errors/ApiError.js';

const validateBestTimeToComeRange = (from, to) => {
  if (from && to && from >= to) {
    throw ApiError.invalidRequest('Invalid best time to come range');
  }
};

export default validateBestTimeToComeRange;
