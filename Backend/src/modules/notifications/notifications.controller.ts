import {
  Controller,
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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto.js';
import {
  NotificationDetailResponseDto,
  NotificationListResponseDto,
} from './dto/notification-response.dto.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List notifications (creates latest weekly/monthly summary if missing; amounts computed live)',
  })
  @ApiOkResponse({ type: NotificationListResponseDto })
  findAll(
    @CurrentUser() user: User,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationsService.findAll(user.id, query);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiNoContentResponse()
  async markAllRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllRead(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Notification with daily + category breakdown for charts' })
  @ApiOkResponse({ type: NotificationDetailResponseDto })
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.findOne(user.id, id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiNoContentResponse()
  async markRead(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.notificationsService.markRead(user.id, id);
  }
}
