import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AppConstants } from '../constants/app.constants';
import { environment } from '../environments/environment';
import { Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StockProductForScanner } from '../model/stock';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) {
    
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  getStockProductForScanner(barCodeNumber: String) : Observable<StockProductForScanner> {
    //return this.http.get<StockProductForScanner>(environment.rooturl + AppConstants.SINGLE_STOCK_PRODUCT + barCodeNumber).pipe(catchError(this.handleError));
    return this.http.get<StockProductForScanner>(environment.rooturl + AppConstants.SINGLE_STOCK_PRODUCT + barCodeNumber);
  }

}

