import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  historyKey = 'conversion_history';
  history: any[] = [];

  ngOnInit() {
    this.loadHistory();
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

  clearHistory() {
    localStorage.removeItem(this.historyKey);
    this.history = [];
  }
}
