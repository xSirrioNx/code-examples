import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { IFakePlayer, ILevel, TSex } from '../../shared/interfaces';
import { of, Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-level-card',
  templateUrl: './level-card.component.html',
  styleUrls: ['./level-card.component.scss'],
  animations: [
    trigger('cardFlip', [
      state(
        'default',
        style({
          transform: 'rotateY({{ rotate }}deg)',
        }),
        { params: { rotate: 0 } }
      ),
      state(
        'half',
        style({
          transform: 'rotateY({{ rotate }}deg)',
        }),
        { params: { rotate: 0 } }
      ),
      state(
        'flipped',
        style({
          transform: 'rotateY({{ rotate }}deg)',
        }),
        { params: { rotate: 0 } }
      ),
      transition('* => *', [animate('100ms')]),
    ]),
  ],
})
export class LevelCardComponent implements OnInit, OnDestroy {
  @Input() level: ILevel;
  @Input() current: boolean = false;
  @Input() sex: TSex;
  @Input() rating: IFakePlayer[];
  @Input() disableTip: boolean = false;
  @Output() levelClick: EventEmitter<number> = new EventEmitter<number>();

  state: 'flipped' | 'default' | 'half' = 'default';
  rotateAngel: number = 0;
  animation: boolean = false;
  mirrored: boolean = false;
  data: any = {
    imageId: 'pDGNBK9A0sk',
    state: 'default',
  };
  showTip: boolean = false;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor() {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    if (this.current && !this.disableTip) {
      of(null)
        .pipe(delay(5000), takeUntil(this.unsubscribe$))
        .subscribe(() => (this.showTip = true));
    }
  }

  onLevelClick(event: Event) {
    event.stopImmediatePropagation();
    if (this.level.disabled) {
      return;
    }
    this.levelClick.emit(this.level.id);
  }

  cardClicked() {
    if (this.animation) {
      return;
    }
    this.rotateAngel += 90;
    this.state = 'half';
    this.animation = true;
  }

  onAnimationEvent(event: AnimationEvent) {
    if (event.toState === 'half') {
      this.mirrored = event.fromState === 'default';
      this.rotateAngel += 90;
      this.state = event.fromState === 'flipped' ? 'default' : 'flipped';
    } else {
      this.animation = false;
    }
  }
}
