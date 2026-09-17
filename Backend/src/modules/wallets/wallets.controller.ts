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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import { CreateWalletDto } from './dto/create-wallet.dto.js';
import { PaginatedWalletsResponseDto } from './dto/paginated-wallets-response.dto.js';
import { TransferWalletDto } from './dto/transfer-wallet.dto.js';
import { UpdateWalletDto } from './dto/update-wallet.dto.js';
import { WalletResponseDto } from './dto/wallet-response.dto.js';
import { WalletsService } from './wallets.service.js';

@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'List wallets for current user (paginated)' })
  @ApiOkResponse({ type: PaginatedWalletsResponseDto })
  findAll(@CurrentUser() user: User, @Query() query: PaginationQueryDto) {
    return this.walletsService.findAll(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create wallet' })
  @ApiCreatedResponse({ type: WalletResponseDto })
  create(@CurrentUser() user: User, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(user.id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer balance between wallets' })
  @ApiOkResponse({ description: 'Updated wallet balances after transfer' })
  transfer(@CurrentUser() user: User, @Body() dto: TransferWalletDto) {
    return this.walletsService.transfer(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update wallet' })
  @ApiOkResponse({ type: WalletResponseDto })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete wallet' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.walletsService.remove(user.id, id);
  }
}
