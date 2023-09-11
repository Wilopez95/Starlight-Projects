import currency from 'currency.js';
import { CurrencyToSymbol } from '@starlightpro/common/i18n';
import { Currency } from '../../../graphql/api';

export const formatMoney = (value: number, curr: Currency = Currency.Usd): string =>
  currency(value, { symbol: curr ? CurrencyToSymbol[curr] : '', precision: 2 }).format();
