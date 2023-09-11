import { interval, MonoTypeOperatorFunction } from 'rxjs';
import { delayWhen, skipWhile } from 'rxjs/operators';
import { ObservableEntityEvent } from '../../../services/observableEntity';
import { BaseEntity } from '../../../entities';

export const delayUntilAfterQueryRunner = <T extends BaseEntity>(): MonoTypeOperatorFunction<
  ObservableEntityEvent<T>
> =>
  delayWhen((event: ObservableEntityEvent<T>) =>
    interval(100).pipe(
      skipWhile(() => {
        if (!event.event || !event.event.queryRunner) {
          return false;
        }

        return event.event.queryRunner.isTransactionActive || !event.event.queryRunner.isReleased;
      }),
    ),
  );
