import { IsIn } from 'class-validator';

export class PaymentWebhookDto {
  @IsIn(['approved', 'rejected'])
  result: 'approved' | 'rejected';
}
