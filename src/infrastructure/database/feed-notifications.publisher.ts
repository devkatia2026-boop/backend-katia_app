import { Op } from 'sequelize';
import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type { AuthorRole, CommentDTO, PostDTO } from '../../application/ports/social-feed.port';
import type { IFeedNotificationPublisher } from '../../application/ports/feed-notification.port';

const TYPE_NEW_POST = 'FEED_NEW_POST';
const TYPE_NEW_COMMENT = 'FEED_NEW_COMMENT';
const TYPE_NEW_LIKE = 'FEED_NEW_LIKE';

export class SequelizeFeedNotificationPublisher implements IFeedNotificationPublisher {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(
    private readonly models: Pick<DatabaseModels, 'Notification' | 'Student' | 'Trainer'>
  ) {}

  async notifyNewPost(post: PostDTO, authorRole: AuthorRole, authorId: string): Promise<void> {
    const authorName = await this.displayName(authorRole, authorId);
    const title = 'Novo post no feed';
    const message = `${authorName} publicou um novo post.`;

    if (authorRole === 'student') {
      const student = await this.models.Student.findByPk(authorId);
      if (!student) return;
      const trainerId = student.trainer_id;
      await this.persistAndPush(
        {
          student_id: null,
          trainer_id: trainerId,
          title,
          message,
          type: TYPE_NEW_POST,
          data: { postId: post.id },
        },
        () => this.pushTokenForTrainer(trainerId)
      );
      const peers = await this.models.Student.findAll({
        where: { trainer_id: trainerId, id: { [Op.ne]: authorId } },
        attributes: ['id', 'expo_push_token'],
      });
      for (const p of peers) {
        await this.persistAndPush(
          {
            student_id: p.id,
            trainer_id: trainerId,
            title,
            message,
            type: TYPE_NEW_POST,
            data: { postId: post.id },
          },
          () => Promise.resolve(p.expo_push_token?.trim() ?? null)
        );
      }
      return;
    }

    const students = await this.models.Student.findAll({
      where: { trainer_id: authorId },
      attributes: ['id', 'expo_push_token'],
    });
    for (const s of students) {
      await this.persistAndPush(
        {
          student_id: s.id,
          trainer_id: authorId,
          title,
          message,
          type: TYPE_NEW_POST,
          data: { postId: post.id },
        },
        () => Promise.resolve(s.expo_push_token?.trim() ?? null)
      );
    }
  }

  async notifyNewComment(
    post: PostDTO,
    _comment: CommentDTO,
    actorRole: AuthorRole,
    actorId: string
  ): Promise<void> {
    if (!post.author_id || !post.author_type) return;
    if (post.author_id === actorId && post.author_type === actorRole) return;

    const actorName = await this.displayName(actorRole, actorId);
    const title = 'Novo comentário no seu post';
    const message = `${actorName} comentou no seu post.`;

    await this.notifyPostOwner(post, title, message, TYPE_NEW_COMMENT, { postId: post.id });
  }

  async notifyNewLike(post: PostDTO, actorRole: AuthorRole, actorId: string): Promise<void> {
    if (!post.author_id || !post.author_type) return;
    if (post.author_id === actorId && post.author_type === actorRole) return;

    const actorName = await this.displayName(actorRole, actorId);
    const title = 'Nova curtida no seu post';
    const message = `${actorName} curtiu seu post.`;

    await this.notifyPostOwner(post, title, message, TYPE_NEW_LIKE, { postId: post.id });
  }

  private async notifyPostOwner(
    post: PostDTO,
    title: string,
    message: string,
    type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const ownerType = post.author_type as AuthorRole;
    const ownerId = post.author_id!;

    if (ownerType === 'student') {
      const owner = await this.models.Student.findByPk(ownerId, {
        attributes: ['id', 'trainer_id', 'expo_push_token'],
      });
      if (!owner) return;
      await this.persistAndPush(
        {
          student_id: owner.id,
          trainer_id: owner.trainer_id,
          title,
          message,
          type,
          data: { ...data, postId: post.id },
        },
        () => Promise.resolve(owner.expo_push_token?.trim() ?? null)
      );
      return;
    }

    await this.persistAndPush(
      {
        student_id: null,
        trainer_id: ownerId,
        title,
        message,
        type,
        data: { ...data, postId: post.id },
      },
      () => this.pushTokenForTrainer(ownerId)
    );
  }

  private async persistAndPush(
    row: {
      student_id: string | null;
      trainer_id: string | null;
      title: string;
      message: string;
      type: string;
      data: Record<string, unknown>;
    },
    getToken: () => Promise<string | null>
  ): Promise<void> {
    await this.models.Notification.create({
      student_id: row.student_id,
      trainer_id: row.trainer_id,
      title: row.title,
      message: row.message,
      read: false,
      type: row.type,
    });
    const token = await getToken();
    if (!token) return;
    await this.sendExpoPush(token, row.title, row.message, row.data);
  }

  private async pushTokenForTrainer(trainerId: string): Promise<string | null> {
    const t = await this.models.Trainer.findByPk(trainerId, { attributes: ['expo_push_token'] });
    return t?.expo_push_token?.trim() ?? null;
  }

  private async displayName(role: AuthorRole, id: string): Promise<string> {
    if (role === 'trainer') {
      const t = await this.models.Trainer.findByPk(id, { attributes: ['full_name'] });
      return t?.full_name?.trim() || 'Treinadora';
    }
    const s = await this.models.Student.findByPk(id, { attributes: ['full_name'] });
    return s?.full_name?.trim() || 'Aluna';
  }

  private async sendExpoPush(
    token: string,
    title: string,
    body: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const Expo = await this.getExpoModule();
    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido no feed');
      return;
    }
    if (!this.expoClient) {
      this.expoClient = new Expo();
    }
    const expo = this.expoClient;
    try {
      const chunks = expo.chunkPushNotifications([{ to: token, title, body, data }]);
      for (const chunk of chunks) {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        for (const t of tickets) {
          if (t.status === 'error') {
            console.warn('[push] Falha Expo (feed):', t.message, t.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro Expo (feed):', err);
    }
  }

  private async getExpoModule(): Promise<typeof ExpoDefault> {
    if (!this.expoModule) {
      const { default: Expo } = await import('expo-server-sdk');
      this.expoModule = Expo;
    }
    return this.expoModule;
  }
}
