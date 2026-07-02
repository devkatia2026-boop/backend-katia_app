export interface IContentStudentsNotifier {
  notifyCouponCreated(couponId: number): Promise<void>;
  notifyWellbeingCreated(wellbeingId: number): Promise<void>;
}
