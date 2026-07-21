export class Budget {
  id: number;
  categorieId: number;
  amountLimit: number;
  startDate: string;
  endDate: string;
  createdAt: string;

  constructor(
    id: number,
    categorieId: number,
    amountLimit: number,
    startDate: string,
    endDate: string,
    createdAt: string,
  ) {
    this.id = id;
    this.categorieId = categorieId;
    this.amountLimit = amountLimit;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
  }
}
