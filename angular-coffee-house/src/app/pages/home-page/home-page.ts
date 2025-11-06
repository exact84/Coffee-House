import { Component } from '@angular/core';
import { Home } from '../../features/home/home';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  standalone: true,
  imports: [Home],
})
export class HomePage {}
