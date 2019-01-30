export interface BudgetItem {
    id: number;
    name: string;
    everyPayPeriod: boolean;
    includeInCalculations: boolean;
    dueDay: number;
    averagePayment: number;
    note: string;
}
