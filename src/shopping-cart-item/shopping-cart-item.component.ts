import { Component, Input, OnInit } from '@angular/core';
import { Article } from './article';
import { StockProductForScanner } from '../model/stock';

@Component({
  selector: 'app-shopping-cart-item',
  templateUrl: './shopping-cart-item.component.html',
  styleUrls: ['./shopping-cart-item.component.scss']
})
export class ShoppingCartItemComponent implements OnInit {

  constructor() {
  }

  @Input()
  article: StockProductForScanner;

  @Input()
  count: number;

  ngOnInit(): void {
  }

}