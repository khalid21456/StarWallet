export type TransactionType = 'expense' | 'income';

export class Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  categorieId: number | null;
  regleId: number | null;
  createdAt: string;

  constructor(
    id: number,
    amount: number,
    type: TransactionType,
    categorieId: number | null,
    regleId: number | null,
    createdAt: string,
  ) {
    this.id = id;
    this.amount = amount;
    this.type = type;
    this.categorieId = categorieId;
    this.regleId = regleId;
    this.createdAt = createdAt;
  }
}
