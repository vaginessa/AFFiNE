import { Injectable } from '@nestjs/common';
import {
  InjectTransaction,
  type Transaction,
  Transactional,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { type EventPayload, OnEvent } from '../../fundamentals';
import { FeatureKind } from '../features';
import { QuotaConfig } from './quota';
import { QuotaType } from './types';

@Injectable()
export class QuotaService {
  constructor(
    // private readonly prisma: PrismaClient,
    @InjectTransaction()
    private readonly prisma: Transaction<TransactionalAdapterPrisma>
  ) {}

  // get activated user quota
  async getUserQuota(userId: string) {
    const quota = await this.prisma.userFeatures.findFirst({
      where: {
        user: {
          id: userId,
        },
        feature: {
          type: FeatureKind.Quota,
        },
        activated: true,
      },
      select: {
        reason: true,
        createdAt: true,
        expiredAt: true,
        featureId: true,
      },
    });

    if (!quota) {
      // this should unreachable
      throw new Error(`User ${userId} has no quota`);
    }

    const feature = await QuotaConfig.get(this.prisma, quota.featureId);
    return { ...quota, feature };
  }

  // get user all quota records
  async getUserQuotas(userId: string) {
    const quotas = await this.prisma.userFeatures.findMany({
      where: {
        user: {
          id: userId,
        },
        feature: {
          type: FeatureKind.Quota,
        },
      },
      select: {
        activated: true,
        reason: true,
        createdAt: true,
        expiredAt: true,
        featureId: true,
      },
    });
    const configs = await Promise.all(
      quotas.map(async quota => {
        try {
          return {
            ...quota,
            feature: await QuotaConfig.get(this.prisma, quota.featureId),
          };
        } catch (_) {}
        return null as unknown as typeof quota & {
          feature: QuotaConfig;
        };
      })
    );

    return configs.filter(quota => !!quota);
  }

  // switch user to a new quota
  // currently each user can only have one quota
  @Transactional()
  async switchUserQuota(
    userId: string,
    quota: QuotaType,
    reason?: string,
    expiredAt?: Date
  ) {
    const hasSameActivatedQuota = await this.hasQuota(userId, quota);

    if (hasSameActivatedQuota) {
      // don't need to switch
      return;
    }

    const latestPlanVersion = await this.prisma.features.aggregate({
      where: {
        feature: quota,
      },
      _max: {
        version: true,
      },
    });

    // we will deactivate all exists quota for this user
    await this.prisma.userFeatures.updateMany({
      where: {
        id: undefined,
        userId,
        feature: {
          type: FeatureKind.Quota,
        },
      },
      data: {
        activated: false,
      },
    });

    await this.prisma.userFeatures.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        feature: {
          connect: {
            feature_version: {
              feature: quota,
              version: latestPlanVersion._max.version || 1,
            },
            type: FeatureKind.Quota,
          },
        },
        reason: reason ?? 'switch quota',
        activated: true,
        expiredAt,
      },
    });
  }

  async hasQuota(userId: string, quota: QuotaType) {
    return this.prisma.userFeatures
      .count({
        where: {
          userId,
          feature: {
            feature: quota,
            type: FeatureKind.Quota,
          },
          activated: true,
        },
      })
      .then(count => count > 0);
  }

  @OnEvent('user.subscription.activated')
  async onSubscriptionUpdated({
    userId,
  }: EventPayload<'user.subscription.activated'>) {
    await this.switchUserQuota(
      userId,
      QuotaType.ProPlanV1,
      'subscription activated'
    );
  }

  @OnEvent('user.subscription.canceled')
  async onSubscriptionCanceled(
    userId: EventPayload<'user.subscription.canceled'>
  ) {
    await this.switchUserQuota(
      userId,
      QuotaType.FreePlanV1,
      'subscription canceled'
    );
  }
}
