import type { Request, Response } from 'express';
import type { ListCouponsUseCase } from '../../../application/use-cases/coupons/list-coupons.use-case';
import type { GetCouponUseCase } from '../../../application/use-cases/coupons/get-coupon.use-case';
import type { CreateCouponUseCase } from '../../../application/use-cases/coupons/create-coupon.use-case';
import type { UpdateCouponUseCase } from '../../../application/use-cases/coupons/update-coupon.use-case';
import type { DeleteCouponUseCase } from '../../../application/use-cases/coupons/delete-coupon.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  COUPON_IMAGE_FIELDS,
  S3_PREFIX_COUPON,
} from '../../../application/media/image-upload.config';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ContentViewerRole } from '../../../application/parsing/content-viewer.parsing';
import { mergeImageUploadsIntoBody } from '../helpers/merge-image-uploads';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function viewerRole(req: Request): ContentViewerRole {
  return req.authUser!.role as ContentViewerRole;
}

export class CouponsController {
  constructor(
    private readonly listCoupons: ListCouponsUseCase,
    private readonly getCoupon: GetCouponUseCase,
    private readonly createCoupon: CreateCouponUseCase,
    private readonly updateCoupon: UpdateCouponUseCase,
    private readonly deleteCoupon: DeleteCouponUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listCoupons.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        viewerRole(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.couponId), 'couponId');
      const row = await this.getCoupon.execute(id, viewerRole(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_COUPON,
        COUPON_IMAGE_FIELDS
      );
      const created = await this.createCoupon.execute(body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.couponId), 'couponId');
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_COUPON,
        COUPON_IMAGE_FIELDS
      );
      const updated = await this.updateCoupon.execute(id, body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.couponId), 'couponId');
      await this.deleteCoupon.execute(id);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Cupom não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir cupom.' });
    }
  }

  private handleRead(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Cupom não encontrado.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao consultar cupom.' });
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Cupom não encontrado.' });
      return;
    }
    if (error.name === OBJECT_STORAGE_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao salvar cupom.' });
  }
}
