import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import {
  AiClientService,
  type AiMessage,
  type AiToolDefinition,
} from './ai-client.service.js';
import type { ChatHistoryMessageDto } from './dto/chat.dto.js';

const MAX_TOOL_ITERATIONS = 4;

@Injectable()
export class AiService {
  constructor(
    private readonly aiClient: AiClientService,
    private readonly transactionsService: TransactionsService,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  // ---------------------------------------------------------------------
  // Stage 1: quick-add — free text -> structured CreateTransactionDto
  // ---------------------------------------------------------------------

  async quickAdd(userId: string, text: string) {
    const { wallets, categories } = await this.getWalletsAndCategories(userId);

    const today = new Date().toISOString().slice(0, 10);
    const systemPrompt = [
      'You turn a short free-text note about a personal expense or income into JSON.',
      `Today's date is ${today}.`,
      'Pick walletId and categoryId ONLY from the lists below (copy the id exactly).',
      'If the text does not mention a wallet, pick the most sensible default (e.g. the first cash-like wallet).',
      'If the text does not mention a date, use today.',
      'type must be "income" or "expense" and must match the chosen category\'s type.',
      'Respond with ONLY a JSON object: { "walletId": string, "categoryId": string, "amount": number, "type": "income"|"expense", "note": string, "transactionDate": "YYYY-MM-DD" }.',
      '',
      this.describeWalletsAndCategories(wallets, categories),
    ].join('\n');

    const message = await this.aiClient.chatCompletion({
      jsonMode: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
    });

    return this.createTransactionFromJson(userId, message.content);
  }

  private async getWalletsAndCategories(userId: string) {
    const [wallets, categories] = await Promise.all([
      this.walletsRepository.find({ where: { userId } }),
      this.categoriesRepository.find({ where: { userId } }),
    ]);

    if (wallets.length === 0) {
      throw new BadRequestException('You need at least one wallet first');
    }
    if (categories.length === 0) {
      throw new BadRequestException('You need at least one category first');
    }

    return { wallets, categories };
  }

  private describeWalletsAndCategories(wallets: Wallet[], categories: Category[]) {
    return [
      `Wallets: ${JSON.stringify(wallets.map((w) => ({ id: w.id, name: w.name })))}`,
      `Categories: ${JSON.stringify(
        categories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
      )}`,
    ].join('\n');
  }

  private async createTransactionFromJson(userId: string, content: string | null) {
    const parsed = this.safeParseJson(content);
    const dto = plainToInstance(CreateTransactionDto, parsed);
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(
        `Could not build a valid transaction from that: ${errors
          .map((e) => Object.values(e.constraints ?? {}).join(', '))
          .join('; ')}`,
      );
    }

    return this.transactionsService.create(userId, dto);
  }

  private safeParseJson(content: string | null): unknown {
    if (!content) {
      throw new BadRequestException('AI returned an empty response');
    }
    try {
      return JSON.parse(content);
    } catch {
      throw new BadRequestException('AI returned malformed JSON');
    }
  }

  // ---------------------------------------------------------------------
  // Stage 2: chat — tool-calling over the user's own data (no RAG needed:
  // this is small, structured data, so we let the model call real queries
  // instead of guessing numbers).
  // ---------------------------------------------------------------------

  async chat(userId: string, userMessage: string, history: ChatHistoryMessageDto[] = []) {
    const { wallets, categories } = await this.getWalletsAndCategories(userId);
    const today = new Date().toISOString().slice(0, 10);

    const systemPrompt = [
      'You are a helpful personal-finance assistant inside an expense tracker app.',
      `Today's date is ${today}.`,
      'Never invent numbers. Always call a tool to get real data before answering a question about spending, income, balances, or transactions.',
      'When the user asks you to add, record, or log a transaction, call add_transaction — do not just tell them to do it themselves.',
      'For add_transaction, pick walletId and categoryId ONLY from the lists below (copy the id exactly); if no wallet is mentioned, pick the most sensible default.',
      'After a tool call, summarize the result for the user instead of repeating raw JSON.',
      'Answer in the same language the user used. Be concise. Format money with thousand separators and a currency-agnostic "đ" suffix unless told otherwise.',
      '',
      this.describeWalletsAndCategories(wallets, categories),
    ].join('\n');

    const messages: AiMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((h): AiMessage => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage },
    ];

    const tools = this.buildToolDefinitions();

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await this.aiClient.chatCompletion({ messages, tools });
      messages.push(response);

      if (!response.tool_calls || response.tool_calls.length === 0) {
        return { reply: response.content ?? '' };
      }

      for (const call of response.tool_calls) {
        const result = await this.executeTool(
          userId,
          call.function.name,
          call.function.arguments,
        );
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      reply:
        'Xin lỗi, mình chưa thể tổng hợp câu trả lời. Bạn thử hỏi cụ thể hơn nhé.',
    };
  }

  private buildToolDefinitions(): AiToolDefinition[] {
    return [
      {
        type: 'function',
        function: {
          name: 'get_spending_summary',
          description:
            'Get total income/expense and a breakdown by category for a date range. Defaults to the current month.',
          parameters: {
            type: 'object',
            properties: {
              fromDate: { type: 'string', description: 'YYYY-MM-DD, inclusive' },
              toDate: { type: 'string', description: 'YYYY-MM-DD, inclusive' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_recent_transactions',
          description: 'List the most recent transactions for the user.',
          parameters: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Max items, default 10, max 50' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_wallet_balances',
          description: 'Get the current balance of every wallet for the user.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'add_transaction',
          description:
            'Create a new income or expense transaction for the user.',
          parameters: {
            type: 'object',
            properties: {
              walletId: {
                type: 'string',
                description: 'id copied exactly from the Wallets list',
              },
              categoryId: {
                type: 'string',
                description: 'id copied exactly from the Categories list',
              },
              amount: { type: 'number' },
              type: { type: 'string', enum: ['income', 'expense'] },
              note: { type: 'string' },
              transactionDate: {
                type: 'string',
                description: 'YYYY-MM-DD, default today',
              },
            },
            required: ['walletId', 'categoryId', 'amount', 'type'],
          },
        },
      },
    ];
  }

  private async executeTool(userId: string, name: string, rawArgs: string) {
    try {
      const args = this.safeParseJson(rawArgs || '{}') as Record<
        string,
        unknown
      >;

      switch (name) {
        case 'get_spending_summary':
          return await this.getSpendingSummary(
            userId,
            args.fromDate as string | undefined,
            args.toDate as string | undefined,
          );
        case 'list_recent_transactions':
          return await this.listRecentTransactions(
            userId,
            Math.min(Number(args.limit ?? 10) || 10, 50),
          );
        case 'get_wallet_balances':
          return await this.getWalletBalances(userId);
        case 'add_transaction':
          return await this.addTransactionFromTool(userId, args);
        default:
          return { error: `Unknown tool: ${name}` };
      }
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Tool call failed',
      };
    }
  }

  private async addTransactionFromTool(
    userId: string,
    args: Record<string, unknown>,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    return this.createTransactionFromJson(
      userId,
      JSON.stringify({
        walletId: args.walletId,
        categoryId: args.categoryId,
        amount: args.amount,
        type: args.type,
        note: args.note,
        transactionDate: args.transactionDate ?? today,
      }),
    );
  }

  private async getSpendingSummary(
    userId: string,
    fromDate?: string,
    toDate?: string,
  ) {
    const now = new Date();
    const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const defaultTo = now.toISOString().slice(0, 10);
    const from = fromDate ?? defaultFrom;
    const to = toDate ?? defaultTo;

    const rows = await this.transactionsRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'category')
      .select('category.name', 'categoryName')
      .addSelect('t.type', 'type')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.transaction_date BETWEEN :from AND :to', { from, to })
      .groupBy('category.name')
      .addGroupBy('t.type')
      .orderBy('total', 'DESC')
      .getRawMany<{ categoryName: string; type: string; total: string }>();

    const totalIncome = rows
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + Number(r.total), 0);
    const totalExpense = rows
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + Number(r.total), 0);

    return {
      from,
      to,
      totalIncome,
      totalExpense,
      byCategory: rows.map((r) => ({
        categoryName: r.categoryName,
        type: r.type,
        total: Number(r.total),
      })),
    };
  }

  private async listRecentTransactions(userId: string, limit: number) {
    const items = await this.transactionsRepository.find({
      where: { userId },
      relations: { wallet: true, category: true },
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
      take: limit,
    });

    return items.map((t) => ({
      amount: t.amount,
      type: t.type,
      note: t.note,
      transactionDate: String(t.transactionDate).slice(0, 10),
      categoryName: t.category?.name,
      walletName: t.wallet?.name,
    }));
  }

  private async getWalletBalances(userId: string) {
    const wallets = await this.walletsRepository.find({ where: { userId } });
    return wallets.map((w) => ({ name: w.name, balance: Number(w.balance) }));
  }
}
