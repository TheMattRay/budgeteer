import {BudgetItem} from './budget-item';
import {IncomeItem} from './income-item';
import {TransactionItem} from './transaction-item';

export interface DataDump {
    BudgetItems: BudgetItem[];
    IncomeItem: IncomeItem;
    TransactionItems: TransactionItem[];
    Settings: any;
}

export class DataDumpClass implements DataDump {
    public BudgetItems: BudgetItem[];
    public IncomeItem: IncomeItem;
    public TransactionItems: TransactionItem[];
    public Settings: any;

    constructor(item: any) {
        if (item === null) {
            this.BudgetItems = [];
            this.IncomeItem = {} as IncomeItem;
            this.TransactionItems = [];
            this.Settings = {};
            return;
        }
        this.BudgetItems = item.BudgetItems;
        this.IncomeItem = item.IncomeItem;
        this.TransactionItems = item.TransactionItems;
        this.Settings = item.Settings;
    }
}
