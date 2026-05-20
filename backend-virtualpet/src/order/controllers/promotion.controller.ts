import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { PROMOTION_SERVICE } from '../interfaces/promotion-service.interface';
import type { IPromotionService } from '../interfaces/promotion-service.interface';

@Controller('promotions')
export class PromotionController {
  constructor(@Inject(PROMOTION_SERVICE) private readonly promotionService: IPromotionService) {}

  @Post()
  @Roles('BACKOFFICE')
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.createPromotion(dto);
  }

  @Get()
  @Roles('BACKOFFICE')
  findAll() {
    return this.promotionService.findAllPromotions();
  }
}
