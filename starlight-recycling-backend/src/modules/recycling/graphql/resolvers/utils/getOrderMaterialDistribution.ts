import Order from '../../../entities/Order';
import { OrderMaterialDistribution } from '../../../entities/OrderMaterialDistribution';
import { OrderMiscellaneousMaterialDistribution } from '../../../entities/OrderMiscellaneousMaterialDistribution';
import { HaulingMaterial } from '../../../../../services/core/types/HaulingMaterial';

export const getOrderMaterialDistribution = (
  order: Order,
  materials: HaulingMaterial[],
  CtxOrderMaterialDistribution: typeof OrderMaterialDistribution,
): OrderMaterialDistribution[] =>
  materials
    .filter((material) => {
      if (!material) {
        return false;
      }

      const { yard, active } = material;

      return yard && active;
    })
    .map((material) =>
      CtxOrderMaterialDistribution.create({
        materialId: material.id,
        order,
        value: 0,
        recycle: material.recycle,
      }),
    );

export const getOrderMiscellaneousMaterialDistribution = (
  order: Order,
  materials: HaulingMaterial[],
  CtxOrderMiscellaneousMaterialDistribution: typeof OrderMiscellaneousMaterialDistribution,
): OrderMiscellaneousMaterialDistribution[] =>
  materials
    .filter((material) => {
      if (!material) {
        return false;
      }

      const { misc, active } = material;

      return misc && active;
    })
    .map((material) =>
      CtxOrderMiscellaneousMaterialDistribution.create({
        materialId: material.id,
        recycle: material.recycle,
        order,
        quantity: 0,
      }),
    );
