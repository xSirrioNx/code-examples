import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, merge, Observable, Subject, timer } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { IAnimationConfig, IAnimationTexture, IFrameElement } from '../../shared/interfaces';

@Component({
  selector: 'app-tile-animation',
  templateUrl: './tile-animation.component.html',
  styleUrls: ['./tile-animation.component.scss'],
})
export class TileAnimationComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() filePath: string;
  @Input() fileName: string;
  @Input() objectName: string = '';
  @Input() imageExtension: string = 'png';
  @Input() singleFrame: boolean = false;
  @Input() intermediate: boolean = false;
  @Input() fps: number = 30;
  @Input() startIndex: number = 0;
  @Input() framesCount: number;
  @Input() type: 'html' | 'canvas' = 'canvas';
  @Input() smoothCanvas: boolean = false;
  @Input() smoothQuality: 'low' | 'medium' | 'high' = 'medium';
  @Output() configLoaded: EventEmitter<void> = new EventEmitter<void>();
  @Output() animationStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() animationEnd: EventEmitter<number> = new EventEmitter<number>();
  containerWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(0).pipe(
    distinctUntilChanged()
  ) as BehaviorSubject<number>;
  containerHeight$: BehaviorSubject<number> = new BehaviorSubject<number>(0).pipe(
    distinctUntilChanged()
  ) as BehaviorSubject<number>;
  backgroundWidth$: BehaviorSubject<number> = new BehaviorSubject<number>(0).pipe(
    distinctUntilChanged()
  ) as BehaviorSubject<number>;
  backgroundHeight$: BehaviorSubject<number> = new BehaviorSubject<number>(0).pipe(
    distinctUntilChanged()
  ) as BehaviorSubject<number>;
  backgroundPosition$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  backgroundSize$: BehaviorSubject<string> = new BehaviorSubject<string>('auto');
  @ViewChild('canvas', { static: false }) canvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  animationX$: BehaviorSubject<string> = new BehaviorSubject<string>('0px');
  animationY$: BehaviorSubject<string> = new BehaviorSubject<string>('0px');
  private index: number = this.startIndex;
  private image: HTMLImageElement;
  private framesRegExp: RegExp;
  private currentTexture: IAnimationTexture;
  private currentAnimationFrames: IFrameElement[];
  private config: IAnimationConfig;
  private unsubscribe$: Subject<void> = new Subject<void>();
  private stop$: Subject<void> = new Subject<void>();
  private inProgress: boolean = true;

  constructor(private httpClient: HttpClient) {}

  private _scaleMultiplier: number = 1;

  get scaleMultiplier() {
    return this._scaleMultiplier;
  }

  @Input() set scaleMultiplier(value: number) {
    if (value !== this._scaleMultiplier) {
      this._scaleMultiplier = value;
      if (this.singleFrame) {
        this.start();
        return;
      }

      if (!this.intermediate && !this.inProgress) {
        this.start(true);
      }
    }
  }

  private _animationName: string;

  get animationName(): string {
    return this._animationName;
  }

  @Input() set animationName(value: string) {
    this._animationName = value;
    if (this.config && this.currentTexture) {
      this.stop();
      this.setRegexp();
      this.findAnimationFrames();
      if (this.index > this.currentAnimationFrames.length - 1) {
        this.index = this.startIndex;
      }
      this.start();
    }
  }

  ngOnInit(): void {
    this.setRegexp();
  }

  ngAfterViewInit() {
    this.type === 'canvas' ? this.initCanvas() : this.initHtml();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.stop$.complete();
  }

  private setRegexp() {
    this.framesRegExp = new RegExp(
      `${this.objectName}${this.objectName && (this.animationName || !this.singleFrame) ? '/' : ''}${
        this.animationName
      }${this.animationName && !this.singleFrame ? '/' : ''}${this.singleFrame ? '' : '[0-9]+'}`
    );
  }

  private initHtml() {
    combineLatest([this.httpClient.get<IAnimationConfig>(`${this.filePath}/${this.fileName}.json`)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([config]) => {
        this.config = config;
        this.configLoaded.next();
        this.initialize();
      });
  }

  private initCanvas() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    combineLatest([
      this.httpClient.get<IAnimationConfig>(`${this.filePath}/${this.fileName}.json`),
      this.loadImage(`${this.filePath}/${this.fileName}.${this.imageExtension}`),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([config, image]) => {
        this.config = config;
        this.image = image;
        this.configLoaded.next();
        this.initialize();
      });
  }

  private initialize() {
    this.currentTexture = this.config.textures.find((t) => t.image === `${this.fileName}.${this.imageExtension}`)!;
    this.findAnimationFrames();
    this.start();
  }

  private findAnimationFrames() {
    this.currentAnimationFrames = this.currentTexture.frames.filter((f) => this.framesRegExp.test(f.filename));
    if (new RegExp('/[0-9]+').test(this.currentAnimationFrames[0]?.filename)) {
      this.currentAnimationFrames = this.currentAnimationFrames.sort((a, b) => {
        const xs = a.filename.split('/');
        const ys = b.filename.split('/');
        return parseInt(xs[xs.length - 1]) - parseInt(ys[ys.length - 1]);
      });
    }
  }

  private stop() {
    this.stop$.next();
  }

  private start(once: boolean = false) {
    const split = this.currentAnimationFrames[0].filename.split('/');
    const size = split[split.length - 1]?.length;
    timer(0, this.singleFrame || once ? undefined : 1000 / this.fps)
      .pipe(takeUntil(merge(this.unsubscribe$, this.stop$)))
      .subscribe(() => {
        this.inProgress = true;
        this.backgroundSize$.next(
          `${this.currentTexture.size.w * this.scaleMultiplier}px ${
            this.currentTexture.size.h * this.scaleMultiplier
          }px`
        );
        const frameNumber = this.addLeadingZeros(this.index, this.singleFrame ? null : size);
        const filename = `${this.objectName}${this.objectName && (this.animationName || !this.singleFrame) ? '/' : ''}${
          this.animationName
        }${this.animationName && frameNumber ? '/' : ''}${frameNumber || ''}`;
        const frame = this.currentAnimationFrames.find((f) => f.filename === filename)!;
        if (!frame) {
          return;
        }
        const frameWidth = frame.frame.w;
        const frameHeight = frame.frame.h;

        const frameX = frame.frame.x;
        const frameY = frame.frame.y;
        this.containerHeight$.next(frame.sourceSize.h * this.scaleMultiplier);
        this.containerWidth$.next(frame.sourceSize.w * this.scaleMultiplier);

        const dx = frame.spriteSourceSize.x * this.scaleMultiplier;
        const dy = frame.spriteSourceSize.y * this.scaleMultiplier;
        this.animationX$.next(dx + 'px');
        this.animationY$.next(dy + 'px');

        this.type === 'canvas'
          ? this.drawCanvas(frameX, frameY, frameWidth, frameHeight, dx, dy)
          : this.drawHtml(frameX, frameY, frameWidth, frameHeight);
        if (
          this.index >= this.currentAnimationFrames.length - 1 ||
          (this.framesCount !== null && this.index >= this.framesCount)
        ) {
          this.animationEnd.emit(this.index);
          if (this.intermediate) {
            this.index = 0;
          } else {
            this.stop();
            this.inProgress = false;
          }
        } else {
          this.index++;
        }
      });
  }

  private drawCanvas(frameX: number, frameY: number, frameWidth: number, frameHeight: number, dx: number, dy: number) {
    combineLatest([this.containerWidth$, this.containerHeight$]).subscribe(([width, height]) => {
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.ctx.imageSmoothingEnabled = this.smoothCanvas;
      this.ctx.imageSmoothingQuality = this.smoothQuality;
      this.ctx.drawImage(
        this.image,
        frameX,
        frameY,
        frameWidth,
        frameHeight,
        dx,
        dy,
        frameWidth * this.scaleMultiplier,
        frameHeight * this.scaleMultiplier
      );
    });
  }

  private drawHtml(frameX: number, frameY: number, frameWidth: number, frameHeight: number) {
    this.backgroundHeight$.next(frameHeight * this.scaleMultiplier);
    this.backgroundWidth$.next(frameWidth * this.scaleMultiplier);
    this.backgroundPosition$.next(
      `top ${frameY * this.scaleMultiplier * -1}px left ${frameX * this.scaleMultiplier * -1}px`
    );
  }

  private addLeadingZeros(number: number, size: number): string {
    if (!size) {
      return '';
    }
    const string = '000000000' + number;
    return string.substr(string.length - size);
  }

  private loadImage(path: string): Observable<HTMLImageElement> {
    return new Observable((observer) => {
      const img = new Image();
      img.src = path;
      img.onload = function () {
        observer.next(img);
        observer.complete();
      };
      img.onerror = (err) => {
        observer.error(err);
      };
    });
  }
}
