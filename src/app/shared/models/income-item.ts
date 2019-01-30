import {PayPeriodClass} from './pay-period';

export interface IncomeItem {
    payPeriod: PayPeriodClass;
    expectedPay: number;
    actualPay: number;
    carryover: number;
}
