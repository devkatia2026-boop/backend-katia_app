import { Op } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateFeedbackResponseInput,
  FeedbackResponseDTO,
  IFeedbackResponsesRepository,
  PatchFeedbackResponseInput,
} from '../../application/ports/feedback-responses.port';

const ATTR = ['id', 'feedback_id', 'response', 'created_at'] as const;

export class SequelizeFeedbackResponsesRepository implements IFeedbackResponsesRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'ResponsesFeedback'>) {}

  async findById(responseId: number): Promise<FeedbackResponseDTO | null> {
    const row = await this.models.ResponsesFeedback.findByPk(responseId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as FeedbackResponseDTO) : null;
  }

  async listByFeedbackId(feedbackId: number): Promise<FeedbackResponseDTO[]> {
    const rows = await this.models.ResponsesFeedback.findAll({
      attributes: [...ATTR],
      where: { feedback_id: feedbackId },
      order: [
        ['created_at', 'ASC'],
        ['id', 'ASC'],
      ],
      raw: true,
    });
    return rows as FeedbackResponseDTO[];
  }

  async listGroupedByFeedbackIds(feedbackIds: number[]): Promise<Map<number, FeedbackResponseDTO[]>> {
    const grouped = new Map<number, FeedbackResponseDTO[]>();
    if (feedbackIds.length === 0) return grouped;

    const rows = (await this.models.ResponsesFeedback.findAll({
      attributes: [...ATTR],
      where: { feedback_id: { [Op.in]: feedbackIds } },
      order: [
        ['feedback_id', 'ASC'],
        ['created_at', 'ASC'],
        ['id', 'ASC'],
      ],
      raw: true,
    })) as FeedbackResponseDTO[];

    for (const row of rows) {
      const list = grouped.get(row.feedback_id) ?? [];
      list.push(row);
      grouped.set(row.feedback_id, list);
    }
    return grouped;
  }

  async create(input: CreateFeedbackResponseInput): Promise<FeedbackResponseDTO> {
    const row = await this.models.ResponsesFeedback.create(input);
    return row.get({ plain: true }) as FeedbackResponseDTO;
  }

  async update(responseId: number, patch: PatchFeedbackResponseInput): Promise<FeedbackResponseDTO> {
    const [n] = await this.models.ResponsesFeedback.update(patch, { where: { id: responseId } });
    if (n === 0) {
      const err = new Error('Resposta não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(responseId);
    return row as FeedbackResponseDTO;
  }

  async deleteById(responseId: number): Promise<boolean> {
    const n = await this.models.ResponsesFeedback.destroy({ where: { id: responseId } });
    return n > 0;
  }
}
