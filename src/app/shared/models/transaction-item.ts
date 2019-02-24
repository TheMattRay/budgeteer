export interface TransactionItem {
    id: number;
    transactionDate: string;
    transactionType: string;
    estimatedAmount: number;
    actualAmount: number;
    vendorPlace: string;
    note: string;
}
