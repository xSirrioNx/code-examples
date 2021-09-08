import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './layout/main/main.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AnimationsComponent } from './pages/animations/animations.component';
import { TileAnimationComponent } from './components/tile-animation/tile-animation.component';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { LevelCardComponent } from './components/level/level-card.component';
import { RatingComponent } from './components/raiting/rating.component';
import { AngularAnimationComponent } from './pages/angular-animation/angular-animation.component';
import { RxjsComponent } from './pages/rxjs/rxjs.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    AnimationsComponent,
    TileAnimationComponent,
    LevelCardComponent,
    RatingComponent,
    AngularAnimationComponent,
    RxjsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    HttpClientModule,
    MatCardModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
