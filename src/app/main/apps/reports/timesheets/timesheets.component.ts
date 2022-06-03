import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ReportUrls } from './timesheet-model';
import { FeatureFlagService } from 'app/store/services/feature-flag.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class TimesheetsComponent implements OnInit, OnDestroy {
  cards = [];

  private _unsubscribeAll: Subject<any>;

  constructor(private _router: Router, private _featureFlagService: FeatureFlagService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._featureFlagService.onFlagsChanged.subscribe((flag) => {
      if (!!!flag.isFeatureFlagsEnabled) {
        // default: show all
        this.cards = [
          {
            id: 1,
            disabled: false,
            title: 'NAV.REPORTS.EMPLOYEE_CARD.TITLE',
            desc: 'NAV.REPORTS.EMPLOYEE_CARD.DESC',
            img: 'assets/images/reports/employees.svg',
          },
          {
            id: 2,
            disabled: false,
            title: 'NAV.REPORTS.CLIENTS_CARD.TITLE',
            desc: 'NAV.REPORTS.CLIENTS_CARD.DESC',
            img: 'assets/images/reports/clients.svg',
          },
          {
            id: 3,
            disabled: false,
            title: 'NAV.REPORTS.PICTURE_CARD.TITLE',
            desc: 'NAV.REPORTS.PICTURE_CARD.DESC',
            img: 'assets/images/reports/picture-extraction.svg',
          },
          {
            id: 4,
            disabled: false,
            title: 'NAV.REPORTS.DEVICE_CARD.TITLE',
            desc: 'NAV.REPORTS.DEVICE_CARD.DESC',
            img: 'assets/images/reports/device-list.svg',
          },
          {
            id: 5,
            disabled: false,
            title: 'NAV.REPORTS.PACKAGES_CARD.TITLE',
            desc: 'NAV.REPORTS.PACKAGES_CARD.DESC',
            img: 'assets/images/reports/packages.svg',
          },
        ];
        return;
      }

      if (!!flag.isPortalReportEmployeeEnabled) {
        this.cards.push({
          id: 1,
          disabled: false,
          title: 'NAV.REPORTS.EMPLOYEE_CARD.TITLE',
          desc: 'NAV.REPORTS.EMPLOYEE_CARD.DESC',
          img: 'assets/images/reports/employees.svg',
        });
      }

      if (!!flag.isPortalReportClientEnabled) {
        this.cards.push({
          id: 2,
          disabled: false,
          title: 'NAV.REPORTS.CLIENTS_CARD.TITLE',
          desc: 'NAV.REPORTS.CLIENTS_CARD.DESC',
          img: 'assets/images/reports/clients.svg',
        });
      }

      if (!!flag.isPortalReportImagesEnabled) {
        this.cards.push({
          id: 3,
          disabled: false,
          title: 'NAV.REPORTS.PICTURE_CARD.TITLE',
          desc: 'NAV.REPORTS.PICTURE_CARD.DESC',
          img: 'assets/images/reports/picture-extraction.svg',
        });
      }

      if (!!flag.isPortalReportDeviceListEnabled) {
        this.cards.push({
          id: 4,
          disabled: false,
          title: 'NAV.REPORTS.DEVICE_CARD.TITLE',
          desc: 'NAV.REPORTS.DEVICE_CARD.DESC',
          img: 'assets/images/reports/device-list.svg',
        });
      }

      if (!!flag.isPortalReportPackagesEnabled) {
        this.cards.push({
          id: 5,
          disabled: false,
          title: 'NAV.REPORTS.PACKAGES_CARD.TITLE',
          desc: 'NAV.REPORTS.PACKAGES_CARD.DESC',
          img: 'assets/images/reports/packages.svg',
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
      url = ReportUrls.Employee;
    } else if (card.id == 2) {
      url = ReportUrls.Client;
    } else if (card.id == 3) {
      url = ReportUrls.PictureExtraction;
    } else if (card.id == 4) {
      url = ReportUrls.Devices;
    }
    this._router.navigate([url]);
  }
}
