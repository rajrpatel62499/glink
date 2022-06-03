import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { ClientService } from 'app/main/apps/client/client.service';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BannerEditDialogComponent } from './banner/dialogs/card/banner-edit-dialog/banner-edit-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class ClientComponent implements OnInit, OnDestroy {
  boards: any[];

  private _unsubscribeAll: Subject<any>;

  // Actual
  filteredOptions: Observable<string[]>;
  error: any;
  bannerSelections: any = [];
  bannerSelectionsOriginal: any = [];
  clientSelections: any = [];
  clientSelectionsOriginal: any = [];
  detailSelections: any = ['COMMON.SCHEDULES', 'COMMON.EMPLOYEES', 'COMMON.TASKS', 'COMMON.PACKAGES'];
  selectedItem: any = {};
  preSelectedItem: any;
  searchInputBanner: FormControl;
  searchInputClient: FormControl;
  clientEdited: any = {};
  dialogRef: any;

  constructor(
    private _router: Router,
    private _clientService: ClientService,
    private _fuseProgressBarService: FuseProgressBarService,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    public translate: TranslateService
  ) {
    this.searchInputBanner = new FormControl('');
    this.searchInputClient = new FormControl('');

    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.searchInputBanner.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
      .subscribe((searchText) => {
        this.bannerSelections = this.getFilteredBannersFromText(searchText);
        this.clientSelectionsOriginal = [];
        this.clientSelections = [];
        this.searchInputClient.reset();
      });

    this.searchInputClient.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
      .subscribe((searchText) => {
        this.clientSelections = this.getFilteredClientsFromText(searchText);
      });

    this._clientService.onBannerChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((preSelectedBanner) => {
        if (!!preSelectedBanner.banner && !!preSelectedBanner.client) {
          this.preSelectedItem = preSelectedBanner;

          this._router.navigate([], {
            queryParams: {
              banner: null,
              client: null,
              clientId: null,
              locationId: null,
            },
            queryParamsHandling: 'merge',
          });
        }

        this.reset();
      });

    this._clientService.onUsersChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((users) => {
      const noSupervisorUsers = users.filter((item) => {
        return item.type !== 'SUPERVISOR';
      });

      const usersRaw = _.mapValues(_.groupBy(noSupervisorUsers, 'banner'));
      this.bannerSelections = this.clean(usersRaw);
      this.bannerSelectionsOriginal = this.bannerSelections;

      if (!!this.preSelectedItem) {
        this.onClickBanner(this.preSelectedItem.banner);
        this.onClickClient({
          name: this.preSelectedItem.client,
          _id: this.preSelectedItem.clientId,
          locations: [{ _id: this.preSelectedItem.locationId }],
        });
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onClickBanner(banner: any): void {
    this.selectedItem = {
      banner,
      client: '',
      detail: '',
    };

    this.clientSelections = this.bannerSelections[banner];
    this.clientSelectionsOriginal = this.bannerSelections[banner];
  }

  onClickClient(client: any): void {
    this.selectedItem['client'] = client;
  }

  onClickDetail(detail: any): void {
    this.selectedItem['detail'] = detail;

    let locationId = null;
    if (this.selectedItem.client?.locations?.length > 0) {
      locationId = this.selectedItem.client.locations[0]._id;
    }

    if (detail === 'COMMON.EMPLOYEES') {
      this._router.navigate([`/apps/employee/location`], {
        queryParams: {
          banner: this.selectedItem.banner,
          client: this.selectedItem.client.name,
          clientId: this.selectedItem.client._id,
          locationId: locationId,
          title: 'COMMON.EMPLOYEES',
        },
      });
    }

    if (detail === 'COMMON.SCHEDULES') {
      this._router.navigate([`/apps/schedule/location`], {
        queryParams: {
          banner: this.selectedItem.banner,
          client: this.selectedItem.client.name,
          clientId: this.selectedItem.client._id,
          locationId: locationId,
          title: 'COMMON.SCHEDULES',
        },
      });
    }

    if (detail === 'COMMON.TASKS') {
      this._router.navigate([`/apps/task/location`], {
        queryParams: {
          banner: this.selectedItem.banner,
          client: this.selectedItem.client.name,
          clientId: this.selectedItem.client._id,
          locationId: locationId,
          title: 'COMMON.TASKS',
        },
      });
    }

    if (detail === 'COMMON.PACKAGES') {
      this._router.navigate([`/apps/package/location`], {
        queryParams: {
          banner: this.selectedItem.banner,
          client: this.selectedItem.client.name,
          clientId: this.selectedItem.client._id,
          locationId: locationId,
          title: 'COMMON.PACKAGES',
        },
      });
    }

  }

  onClickAddClient(event: any): void {
    this._router.navigate(['/pages/create-property']);
  }

  onClickEditBanner(event: any): void {
    if (!!!this.selectedItem || !!!this.selectedItem.banner) {
      this._matSnackBar.open(
        this.translate.instant('BANNER.BANNER_SELECT_MSG'),
        this.translate.instant('COMMON.OK'),
        {
          verticalPosition: 'top',
          duration: 2000,
        }
      );
      return;
    }
    this.dialogRef = this._matDialog.open(BannerEditDialogComponent, {
      panelClass: 'event-form-dialog',
      data: {
        banner: this.selectedItem.banner,
      },
    });
    this.dialogRef.afterClosed().subscribe((response: FormGroup) => {
      if (!response) {
        return;
      }

      const newEvent = response.getRawValue();
      this._clientService
        .updateBannersAll({
          oldBanner: this.selectedItem.banner,
          newBanner: newEvent.banner,
        })
        .then(() => {
          this.selectedItem['banner'] = newEvent.banner;
        });
    });
  }

  onClickEditClient(event: any): void {
    if (
      !!!this.selectedItem ||
      !!!this.selectedItem.client ||
      !(this.selectedItem.client.locations &&
        this.selectedItem.client.locations.length > 0 &&
        this.selectedItem.client.locations[0]._id)
    ) {
      this._matSnackBar.open(
        this.translate.instant('CLIENT.CLIENT_SELECT_MSG'),
        this.translate.instant('COMMON.OK'),
        {
          verticalPosition: 'top',
          duration: 2000,
        }
      );
      return;
    }

    this._router.navigate([`/apps/user/${this.selectedItem.client._id}`], {
      queryParams: {
        banner: this.selectedItem.banner,
        client: this.selectedItem.client.name,
        clientId: this.selectedItem.client._id,
        locationId: this.selectedItem.client.locations[0]._id,
        title: 'Client',
      },
    });
  }

  onDismiss() {
    this.selectedItem['detail'] = '';
    this.clientEdited = {};
  }

  private clean(dict: any): any {
    var cleaned = {};
    for (var key in dict) {
      if (key !== '') {
        cleaned[key] = dict[key];
      }
    }
    return cleaned;
  }

  private getFilteredBannersFromText(searchText: string): any {
    // search implementation different from other search since collection is a dictionary
    this.reset();

    var filteredBanners = {};
    if (searchText === '') {
      return this.bannerSelectionsOriginal;
    }

    if (
      !!!this.bannerSelectionsOriginal ||
      (!!this.bannerSelectionsOriginal && this.bannerSelectionsOriginal.length == 0)
    ) {
      return [];
    }

    if (!!searchText) {
      for (var key in this.bannerSelectionsOriginal) {
        const value = !!key && key.toString().toLowerCase();
        if (!!value && value.includes(searchText.toLowerCase())) {
          filteredBanners[key] = this.bannerSelectionsOriginal[key];
        }
      }
    }

    return filteredBanners;
  }

  private getFilteredClientsFromText(searchText: string): any {
    var filteredClient = [];
    if (searchText === '') {
      return this.clientSelectionsOriginal;
    }

    if (
      !!!this.clientSelectionsOriginal ||
      (!!this.clientSelectionsOriginal && this.clientSelectionsOriginal.length == 0)
    ) {
      return [];
    }

    if (!!searchText) {
      filteredClient = this.clientSelectionsOriginal.filter((item) => {
        if (!!item.locations && item.locations.length > 0) {
          return item.locations[0].name.toString().toLowerCase().includes(searchText.toLowerCase());
        }
        return false;
      });
    }

    return filteredClient;
  }

  private reset() {
    this.selectedItem = {};
    this.clientSelections = [];
  }
}
