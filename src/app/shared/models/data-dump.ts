import {BudgetItem} from './budget-item';
import {IncomeItem} from './income-item';
import {TransactionItem} from './transaction-item';

export interface DataDump {
    BudgetItems: BudgetItem[];
    IncomeItems: IncomeItem[];
    TransactionItems: TransactionItem[];
    Settings: any;
}

export class DataDumpClass implements DataDump {
    public BudgetItems: BudgetItem[];
    public IncomeItems: IncomeItem[];
    public TransactionItems: TransactionItem[];
    public Settings: any;

    constructor(item: any) {
        if (item === null) {
            this.BudgetItems = [];
            this.IncomeItems = [];
            this.TransactionItems = [];
            this.Settings = {};
            return;
        }
        this.BudgetItems = item.BudgetItems;
        this.IncomeItems = item.IncomeItems;
        this.TransactionItems = item.TransactionItems;
        this.Settings = item.Settings;
    }
}
