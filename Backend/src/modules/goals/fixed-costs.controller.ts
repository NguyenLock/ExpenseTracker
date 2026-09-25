import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import {
  CreateFixedCostDto,
  UpdateFixedCostDto,
} from './dto/fixed-cost.dto.js';
import { GoalsService } from './goals.service.js';

@ApiTags('fixed-costs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fixed-costs')
export class FixedCostsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'List monthly fixed costs (rent, etc.)' })
  @ApiOkResponse({ description: 'Fixed costs' })
  findAll(@CurrentUser() user: User) {
    return this.goalsService.listFixedCosts(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create fixed cost' })
  @ApiCreatedResponse({ description: 'Created fixed cost' })
  create(@CurrentUser() user: User, @Body() dto: CreateFixedCostDto) {
    return this.goalsService.createFixedCost(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fixed cost' })
  @ApiOkResponse({ description: 'Updated fixed cost' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFixedCostDto,
  ) {
    return this.goalsService.updateFixedCost(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete fixed cost' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.goalsService.removeFixedCost(user.id, id);
  }
}
