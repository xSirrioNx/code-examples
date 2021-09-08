import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-animations',
  templateUrl: './animations.component.html',
  styleUrls: ['./animations.component.scss'],
})
export class AnimationsComponent implements OnInit, OnDestroy {
  firstAnimationState: string = 'run';
  framesCount: number = 4;
  boyAnimation: string = 'default';
  private firstAnimationsStates: string[] = ['run', 'calm', 'jump'];
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    let index = 0;
    timer(0, 2000)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.firstAnimationState = this.firstAnimationsStates[index];
        if (index < this.firstAnimationsStates.length - 1) {
          index++;
        } else {
          index = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onCoinsAnimationEnd(event: number) {
    this.framesCount = Math.floor(Math.random() * 10) + 1;
  }
}
