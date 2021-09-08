import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnimationsComponent } from './pages/animations/animations.component';
import { AngularAnimationComponent } from './pages/angular-animation/angular-animation.component';
import { RxjsComponent } from './pages/rxjs/rxjs.component';

const routes: Routes = [
  {
    path: 'animations',
    component: AnimationsComponent,
  },
  {
    path: 'angular-animation',
    component: AngularAnimationComponent,
  },
  {
    path: 'rxjs',
    component: RxjsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
