import { Article } from './article';
import { StockProductForScanner } from '../model/stock';
import { ModalService } from '../_modal/modal.service';

export class ShoppingCart {

  //items: Map<Article, number>;
  items: Map<String, StockProductForScanner>;

  constructor(private modalService: ModalService) {
    //this.items = new Map<Article, number>();
    this.items = new Map<String, StockProductForScanner>();
  }

  ngOnInit(): void {
  }
  /*
  addArticle(article: Article) {
    if (this.items.has(article)) {
      this.items.set(article, this.items.get(article) + 1);
    } else {
      this.items.set(article, 1);
    }
  }
  */

  /*
  addStockProduct(stockProductForScanner: StockProductForScanner) {
    if (this.items.has(stockProductForScanner)) {
      this.items.set(stockProductForScanner, this.items.get(stockProductForScanner) + 1);
      //this.modalService.open('custom-modal-1');
    } else {
      this.items.set(stockProductForScanner, 1);
      //this.modalService.open('custom-modal-1');
    }

  }*/

  addStockProduct(stockProductForScanner: StockProductForScanner) {
      this.items.set(stockProductForScanner.bar_code_number, stockProductForScanner);
  }

  checkIfProductAlreadyScanned (stockProductForScanner: StockProductForScanner) {
    let k = this.items.has(stockProductForScanner.bar_code_number);
    return k;
  }

  openModal (modalId) {
    this.modalService.open(modalId);
  }

  get shoppingCartItems() {
    return this.items.entries();
  }

  get isEmpty(): boolean {
    return this.items.size === 0;
  }

  get totalPrice(): number {
    let total = 0;
    for (const entry of this.items.entries()) {
     // total += entry[0].quantityInStock * entry[1];
    }
    return total;
  }
}