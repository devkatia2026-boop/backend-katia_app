import type { PagedList } from './social-feed.port';

export type NotificationDTO = {
  id: number;
  student_id: string | null;
  trainer_id: string | null;
  title: string;
  message: string;
  read: boolean;
  type: string;
  data: Record<string, unknown> | null;
  created_at: Date;
};

export interface INotificationsRepository {
  listForMine(
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<NotificationDTO>>;
  /** Aluna só vê onde é destinatária em `student_id`; treinadora onde é destinatária em `trainer_id`. */
  findByIdForViewer(
    id: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<NotificationDTO | null>;
  /** Marca como lida respeitando o destinatário; retorna a notificação atualizada ou `null`. */
  markReadForViewer(
    id: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<NotificationDTO | null>;
  /** Marca todas as não lidas do destinatário; retorna a quantidade atualizada. */
  markAllReadForViewer(viewer: { role: 'student' | 'trainer'; sub: string }): Promise<number>;
}
