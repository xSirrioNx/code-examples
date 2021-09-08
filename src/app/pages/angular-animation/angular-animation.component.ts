import { Component, OnInit } from '@angular/core';
import { IFakePlayer, ILevel } from '../../shared/interfaces';
import { RATING } from '../../shared/constants';

@Component({
  selector: 'app-angular-animation',
  templateUrl: './angular-animation.component.html',
  styleUrls: ['./angular-animation.component.scss'],
})
export class AngularAnimationComponent implements OnInit {
  level: ILevel = {
    id: 1,
    name: 'Под матрасом',
    coins: 0,
    maxCoins: 150,
    completed: false,
  };

  rating: IFakePlayer[] = RATING;

  constructor() {}

  ngOnInit(): void {}
}
