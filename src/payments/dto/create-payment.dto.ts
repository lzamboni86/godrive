export class CreatePaymentDto {
  externalReference: string;
  payerEmail: string;
  payerName: string;
  payerDocument?: string;
  items: {
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}
