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
import { DebtsService } from './debts.service.js';
import { CreateDebtDto } from './dto/create-debt.dto.js';
import { DebtResponseDto } from './dto/debt-response.dto.js';
import { ListDebtsQueryDto } from './dto/list-debts-query.dto.js';
import { UpdateDebtDto } from './dto/update-debt.dto.js';

@ApiTags('debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  @ApiOperation({ summary: 'List debts (also runs due auto-income settle)' })
  @ApiOkResponse({ type: [DebtResponseDto] })
  findAll(@CurrentUser() user: User, @Query() query: ListDebtsQueryDto) {
    return this.debtsService.findAll(user.id, query);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Open debts due soon / overdue for reminders' })
  @ApiOkResponse({ type: [DebtResponseDto] })
  reminders(@CurrentUser() user: User) {
    return this.debtsService.getReminders(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create debt / receivable' })
  @ApiCreatedResponse({ type: DebtResponseDto })
  create(@CurrentUser() user: User, @Body() dto: CreateDebtDto) {
    return this.debtsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update open debt' })
  @ApiOkResponse({ type: DebtResponseDto })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDebtDto,
  ) {
    return this.debtsService.update(user.id, id, dto);
  }

  @Post(':id/settle')
  @ApiOperation({
    summary: 'Mark debt settled and create matching transaction',
  })
  @ApiOkResponse({ type: DebtResponseDto })
  settle(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.debtsService.settle(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete debt' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.debtsService.remove(user.id, id);
  }
}
