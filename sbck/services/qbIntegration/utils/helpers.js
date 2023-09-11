import startCase from 'lodash/startCase.js';

import { subDays, endOfToday, endOfDay } from 'date-fns';

import { AccountType } from '../../../consts/qbAccountTypes.js';
import { mathRound2 } from '../../../utils/math.js';

/**
 * "It takes an array of objects and returns the sum of a field in each object."
 *
 * The function takes two parameters:
 *
 * array: an array of objects
 * field: the name of the field to sum
 * The function returns the sum of the field in each object
 * @param array - The array of objects to be summed.
 * @param [field=sum] string - The field to sum up.
 */
export const calculateSum = (array, field = 'sum') =>
  array.reduce((prev, obj = {}) => {
    return mathRound2(prev + +(obj[field] ?? 0));
  }, 0);

export const findInvoiceAccount = (invoiceData, qbConfiguration) => {
  return (
    qbConfiguration.accounts.find(account => {
      if (+account.customerGroupId === +invoiceData.customerGroupId) {
        let same = false;
        if (invoiceData.billableServiceHTIds) {
          same =
            startCase(invoiceData.description) === startCase(account.description) &&
            account.type === AccountType.SERVICE;
        } else {
          same =
            invoiceData.description === account.description &&
            account.type === AccountType.LINE_ITEM;
        }
        return same;
      }
      return false;
    })?.accountName || qbConfiguration['defaultAccountIncome(Credit)']
  );
};

export const findSurchargeAccount = (surchargeSumData, surcharges, qbConfiguration) => {
  const surchargeData = surcharges.find(el =>
    el.historicalIds?.includes(surchargeSumData.surchargeId),
  );

  const defaultAccount = qbConfiguration['defaultAccountIncome(Credit)'];
  if (!surchargeData) {
    return defaultAccount;
  }

  return (
    qbConfiguration.accounts.find(account => {
      if (+account.customerGroupId === +surchargeSumData.customerGroupId) {
        return (
          surchargeData.description === account.description &&
          account.type === AccountType.SURCHARGE
        );
      }
      return false;
    })?.accountName || defaultAccount
  );
};

export const findTaxAccount = (taxDistrict, taxes, qbConfiguration) => {
  const tax = taxes.find(taxElement => taxElement.historicalIds.includes(taxDistrict.id));

  return (
    qbConfiguration.accounts.find(account => {
      return (
        account.type === AccountType.TAX &&
        account.description === tax.description &&
        account.districtType === tax.districtType
      );
    })?.accountName || qbConfiguration['defaultAccountTax(Credit)']
  );
};

/**
 * It takes a sum and an account name and returns an object that can be used in a QuickBooks Web Connect API
 * call
 * @param sum - the sum of the transaction
 * @param accountName - The name of the account to map the sum to.
 * @returns An object with two properties: AccountRef and Amount.
 */
export const mapSumOnAccount = (sum, accountName) => {
  return {
    AccountRef: {
      FullName: accountName,
    },
    Amount: Math.abs(mathRound2(sum)).toFixed(2),
  };
};

/**
 * It takes an array of objects, and returns an array of objects, where each object has a property
 * called `AccountRef` with a property called `FullName` and a property called `Amount`
 * @param accounts - an array of objects with the following structure:
 * @returns An array of objects with the keys of AccountRef and Amount.
 */
export const squeezeSameAccounts = accounts => {
  const squeezeObj = accounts
    .filter(Boolean)
    .reduce((squeezeOb, { AccountRef: { FullName: accountName }, Amount }) => {
      if (!squeezeOb[accountName]) {
        squeezeOb[accountName] = 0;
      }
      squeezeOb[accountName] += +Amount;
      return squeezeOb;
    }, {});

  return Object.entries(squeezeObj).map(([accountName, amount]) =>
    mapSumOnAccount(amount, accountName),
  );
};

/**
 * It checks if the array has a sum of zero, and if it does, it returns the name of the array
 * @param array - the array to check
 * @param name - The name of the field that is being checked.
 * @returns The name of the array that has a sum of 0.
 */
export const checkZeroSum = (array, name) => {
  if (array === 0) {
    return name;
  }
  if (Array.isArray(array)) {
    const zeroElement = array?.find(el => {
      return el?.sum === 0;
    });
    if (zeroElement) {
      return name;
    }
  }
  return null; //check
};

/**
 * It takes an array of arrays of numbers and an array of names, and returns an array of strings that
 * are the names of the arrays that have a sum of zero
 * @param array - an array of arrays of numbers
 * @param names - ['a', 'b', 'c', 'd', 'e', 'f']
 */
export const analyzeSums = (array, names) =>
  array.map((sums, index) => checkZeroSum(sums, names[index])).filter(Boolean);

/**
 * It takes a date and returns the same date, but at the end of the day
 * @param lastSuccessfulIntegration - The date of the last successful integration.
 * @returns The end of the day of the last successful integration.
 */
export const calculateRangeFrom = lastSuccessfulIntegration => {
  return endOfDay(lastSuccessfulIntegration);
};

/**
 * It returns a date that is the number of days before today that is passed in as an argument
 * @param dateToAdjustment - The number of days to adjust the date by.
 * @returns A function that takes a dateToAdjustment as an argument and returns a date.
 */
export const calculateRangeTo = dateToAdjustment => {
  return subDays(endOfToday(), dateToAdjustment);
};

export const formatJournalSection = accounts => {
  const formattedAccounts = [];
  accounts.forEach(account => {
    if (formattedAccounts.length === 0) {
      formattedAccounts.push({
        account: account.account,
        type: account.type,
        ammount: parseFloat(account.ammount),
      });
    } else {
      const accountNameIndex = formattedAccounts.findIndex(
        byNameAccount => byNameAccount.account === account.account,
      );
      if (accountNameIndex == -1) {
        formattedAccounts.push({
          account: account.account,
          type: account.type,
          ammount: parseFloat(account.ammount),
        });
      } else {
        const accountTypeIndex = formattedAccounts.findIndex(
          byNameAccount =>
            byNameAccount.account === account.account && byNameAccount.type === account.type,
        );
        if (accountTypeIndex == -1) {
          formattedAccounts.push({
            account: account.account,
            type: account.type,
            ammount: parseFloat(account.ammount),
          });
        } else {
          formattedAccounts[accountTypeIndex].ammount += parseFloat(account.ammount);
        }
      }
    }
  });
  return formattedAccounts;
};
