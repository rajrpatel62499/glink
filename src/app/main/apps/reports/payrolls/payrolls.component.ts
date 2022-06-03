import { ReportUrls } from './../timesheets/timesheet-model';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Subject } from 'rxjs';
import { FeatureFlagService } from 'app/store/services/feature-flag.service';

@Component({
  selector: 'app-payrolls',
  templateUrl: './payrolls.component.html',
  styleUrls: ['./payrolls.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class PayrollsComponent implements OnInit, OnDestroy {
  cards = [];

  private _unsubscribeAll: Subject<any>;

  constructor(private _router: Router, private _featureFlagService: FeatureFlagService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._featureFlagService.onFlagsChanged.subscribe((flag) => {
      // default: show all
      if (!!!flag.isFeatureFlagsEnabled) {
        this.cards = [
          {
            id: 1,
            disabled: false,
            title: 'REPORTS.FINANCE.PAYSLIP_CARD.TITLE',
            desc: 'REPORTS.FINANCE.PAYSLIP_CARD.DESC',
            img: 'assets/images/reports/reports_finance.svg',
          },
        ];
        return;
      }

      if (!!flag.isPortalReportPayEnabled) {
        this.cards.push({
          id: 1,
          disabled: false,
          title: 'REPORTS.FINANCE.PAYSLIP_CARD.TITLE',
          desc: 'REPORTS.FINANCE.PAYSLIP_CARD.DESC',
          img: 'assets/images/reports/reports_finance.svg',
        });
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onClickOfCard(card) {
    let url;
    if (card.id == 1) {
      url = ReportUrls.PayrollExport;
    }

    this._router.navigate([url]);
  }
}
