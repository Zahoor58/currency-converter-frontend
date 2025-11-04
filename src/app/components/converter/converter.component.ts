import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { HistoryComponent } from '../history/history.component';
import { HttpClientModule } from '@angular/common/http';

interface ConversionRecord {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  usedDate: string; // selected historical date or 'latest'
  timestamp: string;

}

@Component({
  selector: 'app-converter',

  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    HistoryComponent,
    HttpClientModule
  ],
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss'],
})
export class ConverterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  currencies: string[] = [];
  result: number | null = null;
  rate: number | null = null;
  today: Date = new Date();
  historyKey = 'conversion_history';
  history: ConversionRecord[] = [];

  constructor(
    private fb: FormBuilder,
    private currencyService: CurrencyService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      from: ['USD', Validators.required],
      to: ['EUR', Validators.required],
      amount: [1, [Validators.required, Validators.min(0)]],
      date: [null], // optional date for historical
    });
  }

  ngOnInit() {
    this.loadCurrencies();
    this.loadHistory();
  }

  private loadCurrencies() {
    this.loading = true;
    this.currencyService.getSymbols().subscribe({
      next: (res: any) => {
        // API returns object like { data: { USD: 1, EUR: 0.9, ... } }
        const rates = res?.data || res?.rates || {};
        this.currencies = Object.keys(rates).sort();
        // ensure defaults exist
        if (!this.currencies.includes(this.form.value.from)) this.form.patchValue({ from: this.currencies[0] });
        if (!this.currencies.includes(this.form.value.to)) this.form.patchValue({ to: this.currencies[1] || this.currencies[0] });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snack.open('Failed to load currencies', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private loadHistory() {
    const raw = localStorage.getItem(this.historyKey);
    if (raw) {
      try {
        this.history = JSON.parse(raw);
      } catch {
        this.history = [];
      }
    }
  }

  private saveHistory() {
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
  }

  convert() {

    if (this.form.invalid) return;
    const { from, to, amount, date } = this.form.value;
    const useDate = date ? this.formatDate(date) : null;


    this.loading = true;
    const obs = useDate ? this.currencyService.getHistorical(useDate, from) : this.currencyService.getLatest(from);
    obs.subscribe({
      next: (res: any) => {
        // rates may be at res.data or res.rates
        const data = res?.data || res?.rates || {};
        const rate = data[to];
        if (rate === undefined) {
          this.snack.open(`Rate for ${to} not available`, 'Close', { duration: 3000 });
          this.loading = false;
          return;
        }
        this.rate = +rate;
        this.result = amount * this.rate;
        const record = {
          from,
          to,
          amount: +amount,
          result: this.result,
          rate: this.rate,
          usedDate: useDate || 'latest',
          timestamp: new Date().toISOString()
        };
        this.history.unshift(record);
        // keep max 100 records
        this.history = this.history.slice(0, 100);
        this.saveHistory();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snack.open('Conversion failed. Try again.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private formatDate(d: any): string {
    const dateObj = new Date(d);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

}
