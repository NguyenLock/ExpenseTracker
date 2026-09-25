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
import { ContributeGoalDto } from './dto/contribute-goal.dto.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { GoalResponseDto } from './dto/goal-response.dto.js';
import { ListGoalsQueryDto } from './dto/list-goals-query.dto.js';
import { PlanGoalDto } from './dto/plan-goal.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalsService } from './goals.service.js';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'List saving goals' })
  @ApiOkResponse({ type: [GoalResponseDto] })
  findAll(@CurrentUser() user: User, @Query() query: ListGoalsQueryDto) {
    return this.goalsService.findAll(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create saving goal' })
  @ApiCreatedResponse({ type: GoalResponseDto })
  create(@CurrentUser() user: User, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get saving goal' })
  @ApiOkResponse({ type: GoalResponseDto })
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.goalsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update saving goal' })
  @ApiOkResponse({ type: GoalResponseDto })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete saving goal' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.goalsService.remove(user.id, id);
  }

  @Post(':id/contribute')
  @ApiOperation({
    summary: 'Contribute to goal (deduct wallet + expense tx + bump saved)',
  })
  @ApiOkResponse({ type: GoalResponseDto })
  contribute(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ContributeGoalDto,
  ) {
    return this.goalsService.contribute(user.id, id, dto);
  }

  @Post(':id/plan')
  @ApiOperation({ summary: 'Plan monthly contribution / defer scenarios' })
  @ApiOkResponse({ description: 'Plan scenarios' })
  plan(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PlanGoalDto,
  ) {
    return this.goalsService.plan(user.id, id, dto);
  }
}
