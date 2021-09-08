import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError, timer } from 'rxjs';
import { catchError, concatMap, delay, filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { IRefreshResult, IStatusResult, TRefreshResult, TStatus } from '../shared/interfaces';

const REQUESTS_TIMEOUT = 5000;

@Injectable({
  providedIn: 'root',
})
export class FakeApiService {
  constructor() {}

  getData(
    pollingStatusArray: TStatus[],
    refreshStatus: TRefreshResult = 'PROCESSING',
    subject: Subject<string>
  ): Observable<{ refreshed: boolean; data: any }> {
    let refreshed: boolean = false;
    return this.refreshDataHttp(refreshStatus).pipe(
      catchError((error) => {
        return throwError(error);
      }),
      concatMap(({ requestId, result }: IRefreshResult) => {
        subject.next(`Refresh status: ${result} => `);
        return this.getRequestStatus(requestId, pollingStatusArray, subject).pipe(
          tap((result) => (refreshed = result))
        );
      }),
      concatMap(() => {
        return this.getDataHttp();
      }),
      map(({ data }) => {
        return {
          refreshed,
          data,
        };
      })
    );
  }

  private getDataHttp(): Observable<{ data: any }> {
    return of({ data: 'FINISHED!' }).pipe(delay(600));
  }

  private refreshDataHttp(result: TRefreshResult): Observable<IRefreshResult> {
    const response: IRefreshResult = {
      requestId: result === 'PROCESSING' ? 1 : null,
      result,
    };
    return of(response).pipe(delay(100));
  }

  private getStatusHttp(status: TStatus): Observable<IStatusResult> {
    return of({ status }).pipe(delay(200));
  }

  private getRequestStatus(requestId: number, statusArray: TStatus[], subject: Subject<string>) {
    /**
     * requestId приходит только при статусе PROCESSING
     */
    if (requestId) {
      let timeout = false;
      const timeout$: Subject<void> = new Subject<void>();
      timer(REQUESTS_TIMEOUT)
        .pipe(takeUntil(timeout$))
        .subscribe(() => {
          timeout = true;
        });
      return timer(0, 1000).pipe(
        concatMap((value, index) => {
          // console.log(value, index);
          const arrayIndex = index < statusArray.length ? index : statusArray.length - 1;
          return this.getStatusHttp(statusArray[arrayIndex]);
        }),
        filter(({ status }: IStatusResult) => {
          subject.next(`Polling status: ${status} => `);
          if (status === 'DONE' || timeout) {
            timeout$.next();
            timeout$.complete();
            return true;
          } else {
            if (status === 'FAILED') {
              timeout$.next();
              timeout$.complete();
              return true;
            }
            return false;
          }
        }),
        map(({ status }: IStatusResult) => status === 'DONE'),
        take(1)
      );
    } else {
      return of(false);
    }
  }
}
