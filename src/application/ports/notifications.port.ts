import type { PagedList } from './social-feed.port';

export type NotificationDTO = {
  id: number;
  student_id: string | null;
  trainer_id: string | null;
  title: string;
  message: string;
  read: boolean;
  type: string;
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
}
