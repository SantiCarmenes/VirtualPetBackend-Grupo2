import type { AppliedPromotion, Promotion } from '@prisma/client';
import { ApplyPromotionDto } from '../dto/apply-promotion.dto';
import { CreatePromotionDto } from '../dto/create-promotion.dto';

export const PROMOTION_SERVICE = 'PROMOTION_SERVICE';

export interface IPromotionService {
  createPromotion(dto: CreatePromotionDto): Promise<Promotion>;
  findAllPromotions(): Promise<Promotion[]>;
  applyPromotion(userId: string, orderId: string, dto: ApplyPromotionDto): Promise<AppliedPromotion>;
}
