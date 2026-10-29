import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import { TransactionResponseDto } from '../transactions/dto/transaction-response.dto.js';
import { AiService } from './ai.service.js';
import { ChatDto } from './dto/chat.dto.js';
import { ChatResponseDto } from './dto/chat-response.dto.js';
import { QuickAddDto } from './dto/quick-add.dto.js';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('quick-add')
  @ApiOperation({
    summary: 'Create a transaction from a free-text note using an LLM',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  quickAdd(@CurrentUser() user: User, @Body() dto: QuickAddDto) {
    return this.aiService.quickAdd(user.id, dto.text);
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Ask a question about your own spending (LLM + tool-calling)',
  })
  @ApiOkResponse({ type: ChatResponseDto })
  chat(@CurrentUser() user: User, @Body() dto: ChatDto) {
    return this.aiService.chat(user.id, dto.message, dto.history);
  }
}
