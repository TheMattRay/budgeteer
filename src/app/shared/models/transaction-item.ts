export interface TransactionItem {
    transactionDate: Date;
    transactionType: string;
    estimatedAmount: number;
    actualAmount: number;
    vendorPlace: string;
    note: string;
}
