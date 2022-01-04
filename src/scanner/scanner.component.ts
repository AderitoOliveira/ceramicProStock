import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BeepService } from '../shopping-cart-item/beep.service';
import Quagga from 'quagga';
import { Article } from '../shopping-cart-item/article';
import { ShoppingCart } from '../shopping-cart-item/shopping-cart';
import { UpdateService } from '../shopping-cart-item/update.service';
import { StockService } from '../_services/stock-service';
import { StockProductForScanner } from 'src/model/stock';
import { ModalService } from '../_modal/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScannerComponent implements OnInit, AfterViewInit {

  errorMessage: string;

  shoppingCart: ShoppingCart;
  bodyText : string;
  //modalService: ModalService;

  private catalogue: Article[] = [
    { name: 'Classy Crab (red)', ean: '7601234567890', image: 'assets/classy_crab_red.png', price: 10 },
    { name: 'Classy Crab (blue)', ean: '7601234561232', image: 'assets/classy_crab_blue.png', price: 10 },
    { name: 'Classy Crab (gold, ltd. ed.)', ean: '7601234564561', image: 'assets/classy_crab_gold.png', price: 50 }
  ];

  private lastScannedCode: string;
  private lastScannedCodeDate: number;
  private productInStock: StockProductForScanner;
  private ipAddress: string;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private beepService: BeepService,
              private updateService: UpdateService,
              private stockService: StockService,
              private modalService: ModalService) {
    this.shoppingCart = new ShoppingCart(modalService);
    //this.modalService = new ModalService();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!navigator.mediaDevices || !(typeof navigator.mediaDevices.getUserMedia === 'function')) {
      this.errorMessage = 'getUserMedia is not supported';
      return;
    }

    Quagga.init({
        inputStream: {
          constraints: {
            width: 640,
            height: 480,
            facingMode: 'environment'
          },
         /*area: { // defines rectangle of the detection/localization area
            top: '40%',    // top offset
            right: '0%',  // right offset
            left: '0%',   // left offset
            bottom: '40%'  // bottom offset
          },*/
        },
        numOfWorkers: 0,
        multiple: false,
        frequency: 5,
        decoder: {
          halfSample: true,
          patchSize: "large",
          drawBoundingBox: true,
          showFrequency: true,
          drawScanline: true,
          showPattern: true,
          readers: ['ean_reader'],
          debug: {
            showCanvas: true,
            showPatches: true,
            showFoundPatches: true,
            showSkeleton: true,
            showLabels: true,
            showPatchLabels: true,
            showRemainingPatchLabels: true,
            boxFromPatches: {
                showTransformed: true,
                showTransformedBox: true,
                showBB: true
            }
          }
        },
        locate: true, 
      },
      (err) => {
        if (err) {
          this.errorMessage = `QuaggaJS could not be initialized, err: ${err}`;
        } else {
          Quagga.start();
          Quagga.onDetected((res) => {
            const now = new Date().getTime();
            const now2 = new Date();
            if (res.codeResult.code === this.lastScannedCode && (now < this.lastScannedCodeDate + 3000)) {
              console.log('Starting to sleep: ' + now2);
              setTimeout(() => {
                console.log('Slept for: ' + now2);
              }, 10000);
            } else {
              console.log('res.codeResult.code: ' + res.codeResult.code);
              this.onBarcodeScanned(res.codeResult.code);
            }

          });
          
          /*
          Quagga.onProcessed(function (result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;
          
            if (result) {
              if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                  return box !== result.box;
                }).forEach(function (box) {
                  Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                });
              }
          
              if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
              }
          
              if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
              }
            }
          });
          */

          /*
          Quagga.onProcessed(function (result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                }
            }
        }); */

        }
      });

    setTimeout(() => {
      this.updateService.checkForUpdates();
    }, 10000);
  }


  

  onBarcodeScanned(barCodeNumber: string) {

    // ignore duplicates for an interval of 1.5 seconds
    const now = new Date().getTime();
    if (barCodeNumber === this.lastScannedCode && (now < this.lastScannedCodeDate + 5000)) {
      return;
    };

    // ignore unknown articles
    //const article = this.catalogue.find(a => a.ean === code);
    this.stockService.getStockProductForScanner(barCodeNumber).subscribe(product => 
        {
          console.log(barCodeNumber);
          this.productInStock = product;

          if (!this.productInStock) {
            return;
          }

          if(this.productInStock) {
            console.log("Produto: " + this.productInStock.productName) 
            
            let x = this.shoppingCart.checkIfProductAlreadyScanned(this.productInStock);
            if(x) {
              this.shoppingCart.openModal('custom-modal-2');
            } else {
              this.shoppingCart.openModal('custom-modal-1');
            }

            //this.shoppingCart.openModal('custom-modal-1');
          }

        }
      );
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  save() {
    const now = new Date().getTime();
    this.modalService.close('custom-modal-1');

    this.shoppingCart.addStockProduct(this.productInStock);
    this.lastScannedCodeDate = now;
    this.beepService.beep();
    this.changeDetectorRef.detectChanges();
    //this.modalService.remove('custom-modal-1');
    //this.modalService.add('custom-modal-1');
  }

}