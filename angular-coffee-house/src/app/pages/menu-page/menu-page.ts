import { Component } from '@angular/core';
import { MenuComponent } from '../../features/menu/ui/menu';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.html',
  standalone: true,
  imports: [MenuComponent],
})
export class MenuPage {}
