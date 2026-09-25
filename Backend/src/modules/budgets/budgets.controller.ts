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
  Query,
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
import { BudgetsService } from './budgets.service.js';
import { BudgetResponseDto } from './dto/budget-response.dto.js';
import { CopyBudgetsDto } from './dto/copy-budgets.dto.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { ListBudgetsQueryDto } from './dto/list-budgets-query.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List budgets for a month (with spent)' })
  @ApiOkResponse({ type: [BudgetResponseDto] })
  findAll(@CurrentUser() user: User, @Query() query: ListBudgetsQueryDto) {
    return this.budgetsService.findAll(user.id, query);
  }

  @Post('copy')
  @ApiOperation({ summary: 'Copy budgets from one month to another' })
  @ApiOkResponse({ description: 'Copied budgets for toMonth' })
  copy(@CurrentUser() user: User, @Body() dto: CopyBudgetsDto) {
    return this.budgetsService.copy(user.id, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create monthly category or overall budget' })
  @ApiCreatedResponse({ type: BudgetResponseDto })
  create(@CurrentUser() user: User, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget limit' })
  @ApiOkResponse({ type: BudgetResponseDto })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete budget' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.budgetsService.remove(user.id, id);
  }
}
