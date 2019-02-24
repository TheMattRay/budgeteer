export interface TransactionItem {
    id: number;
    transactionDate: Date;
    transactionType: string;
    estimatedAmount: number;
    actualAmount: number;
    vendorPlace: string;
    note: string;
}
