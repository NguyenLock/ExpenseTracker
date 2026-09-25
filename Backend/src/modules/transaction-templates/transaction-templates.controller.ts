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
import { CreateTransactionTemplateDto } from './dto/create-transaction-template.dto.js';
import { TransactionTemplateResponseDto } from './dto/transaction-template-response.dto.js';
import { UpdateTransactionTemplateDto } from './dto/update-transaction-template.dto.js';
import { TransactionTemplatesService } from './transaction-templates.service.js';

@ApiTags('transaction-templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transaction-templates')
export class TransactionTemplatesController {
  constructor(
    private readonly templatesService: TransactionTemplatesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List transaction shortcuts for current user' })
  @ApiOkResponse({ type: [TransactionTemplateResponseDto] })
  findAll(@CurrentUser() user: User) {
    return this.templatesService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create transaction shortcut' })
  @ApiCreatedResponse({ type: TransactionTemplateResponseDto })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateTransactionTemplateDto,
  ) {
    return this.templatesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction shortcut' })
  @ApiOkResponse({ type: TransactionTemplateResponseDto })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionTemplateDto,
  ) {
    return this.templatesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete transaction shortcut' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.templatesService.remove(user.id, id);
  }
}
