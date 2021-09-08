import { Component, Input, OnInit } from '@angular/core';
import { IFakePlayer, TSex } from '../../shared/interfaces';
import { binarySearch } from '../../shared/utils';
import { FAKE_PLAYERS_PATH } from '../../shared/constants';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {
  @Input() rating: IFakePlayer[];
  @Input() coins: number;
  @Input() sex: TSex;
  @Input() isSmall: boolean = false;
  @Input() completed: boolean;

  players: IFakePlayer[];

  constructor() {}

  ngOnInit(): void {
    if (!this.completed) {
      this.players = this.rating.slice(-4).reverse();
      return;
    }

    let playerIndex = binarySearch(
      this.rating.map((r) => r.coins),
      this.coins
    );

    let cloned = this.rating.map((r) => {
      return { ...r };
    });

    if (playerIndex < 0) {
      cloned.splice(Math.abs(playerIndex) - 1, 0, {
        name: 'Вы',
        isReal: true,
        image: `${FAKE_PLAYERS_PATH}/${this.sex}.png`,
        coins: this.coins,
      });
    } else {
      cloned.splice(playerIndex + 1, 0, {
        name: 'Вы',
        isReal: true,
        image: `${FAKE_PLAYERS_PATH}/${this.sex}.png`,
        coins: this.coins,
      });
    }

    let startIndex;
    let endIndex;

    switch (true) {
      case Math.abs(playerIndex) <= 2:
        if (playerIndex <= 0) {
          startIndex = 0;
          endIndex = 4;
        } else {
          startIndex = 1;
          endIndex = 5;
        }
        break;
      case Math.abs(playerIndex) > cloned.length - 2:
        startIndex = cloned.length - 4;
        endIndex = cloned.length;
        break;
      default:
        const maxCoins = cloned[cloned.length - 1].coins;
        let add = 1;
        if (playerIndex < 0) {
          add = -1;
        }
        if (this.coins >= maxCoins) {
          add = 0;
        }
        startIndex = Math.abs(playerIndex) + add - 2;
        endIndex = Math.abs(playerIndex) + add + 2;
    }

    this.players = cloned.slice(startIndex, endIndex).reverse();
  }
}
