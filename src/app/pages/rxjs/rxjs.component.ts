import { Component, OnDestroy, OnInit } from '@angular/core';
import { FakeApiService } from '../../services/fake-api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TRefreshResult, TStatus } from '../../shared/interfaces';

interface IExample {
  title: string;
  description: string;
  pollingArray: TStatus[];
  resultsArray$: BehaviorSubject<any[]>;
  subject$: Subject<string>;
  refreshStatus: TRefreshResult;
}

@Component({
  selector: 'app-rxjs',
  templateUrl: './rxjs.component.html',
  styleUrls: ['./rxjs.component.scss'],
})
export class RxjsComponent implements OnInit, OnDestroy {
  examples: IExample[] = [
    {
      title: 'Refresh TIMED_OUT',
      description:
        'На серваке уже идет другой запрос<br>за такими же данными, но он не<br>может отдать ID того запроса',
      pollingArray: ['DONE'],
      resultsArray$: new BehaviorSubject<any[]>([]),
      subject$: new Subject<string>(),
      refreshStatus: 'SEND_TIMEOUT',
    },
    {
      title: 'Сразу SUCCESS',
      description: '',
      pollingArray: ['DONE'],
      resultsArray$: new BehaviorSubject<any[]>([]),
      subject$: new Subject<string>(),
      refreshStatus: 'PROCESSING',
    },
    {
      title: 'Сразу FAIL',
      description: '',
      pollingArray: ['FAILED'],
      resultsArray$: new BehaviorSubject<any[]>([]),
      subject$: new Subject<string>(),
      refreshStatus: 'PROCESSING',
    },
    {
      title: 'SUCCESS до таймаута',
      description: '',
      pollingArray: ['PROCESSING', 'PROCESSING', 'PROCESSING', 'DONE'],
      resultsArray$: new BehaviorSubject<any[]>([]),
      subject$: new Subject<string>(),
      refreshStatus: 'PROCESSING',
    },
    {
      title: 'FAIL до таймаута',
      description: '',
      pollingArray: ['PROCESSING', 'PROCESSING', 'PROCESSING', 'FAILED'],
      resultsArray$: new BehaviorSubject<any[]>([]),
      subject$: new Subject<string>(),
      refreshStatus: 'PROCESSING',
    },
    {
      title: 'Таймаут (более 5 секунд)',
      description: '',
      pollingArray: ['PROCESSING'],
      resultsArray$: new BehaviorSubject<any[]>([]),
      subject$: new Subject<string>(),
      refreshStatus: 'PROCESSING',
    },
  ];

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private fakeApiService: FakeApiService) {}

  ngOnInit(): void {
    this.examples.forEach((ex) => {
      ex.subject$.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
        ex.resultsArray$.next([...ex.resultsArray$.value, value]);
      });
      this.fakeApiService
        .getData(ex.pollingArray, ex.refreshStatus, ex.subject$)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          ex.resultsArray$.next([...ex.resultsArray$.value, result]);
        });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
