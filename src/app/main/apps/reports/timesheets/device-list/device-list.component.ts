import { DeviceService } from './device.service';
import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { ColumnMode, TableColumn } from '@swimlane/ngx-datatable';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import {
  ReportFilters,
  ReportUrls,
  SortFilters,
} from '../timesheet-model';
import { ConfigService } from 'app/store/services/config.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe]
})
export class DeviceListComponent implements OnInit {
  header = {
    title: 'COMMON.REPORTS',
    path: 'COMMON.OPERATIONS',
    subpath: 'COMMON.DEVICES',
  };

  activeListSelection = [
    { id: 1, value: 'True', selected: true },
    { id: 2, value: 'False', selected: true },
  ];

  private _totalCount: string = '0';

  get deviceMap() {
    return this._deviceService.devicesMap;
  }
  get deviceNotFoundMap() {
    return this._deviceService.deviceNotFoundMap;
  }
  get allDevicesLoaded() {
    return this._deviceService.allDevicesLoaded;
  }

  get totalCount() {
    return this._totalCount;
  }

  set totalCount(value) {
    if (value) {
      this._totalCount = Number.parseFloat(value).toFixed(0);
    } else {
      this._totalCount = '0';
    }
  }

  filters: ReportFilters = new ReportFilters();
  sortFilters = new SortFilters();

  ColumnMode = ColumnMode;
  rows: any[] = [];
  get filterdRows() {
    const selectedValues = this.activeListSelection.filter((x) => x.selected).map((x) => x.value);

    if (selectedValues.length == 0) return [];

    if (selectedValues.length == 1) {
      if (selectedValues.includes('True')) return this.rows.filter((x) => x.compliant);
      if (selectedValues.includes('False')) return this.rows.filter((x) => !x.compliant);
    }

    return this.rows;
  }

  columns: TableColumn[] = [
    { prop: 'deviceName', name: 'COMMON.NAME', sortable: true, resizeable: true },
    { prop: 'lastReported', name: 'COMMON.LAST_UPDATE', sortable: true, resizeable: true },
    { prop: 'compliant', name: 'COMMON.COMPLIANCE', sortable: true, resizeable: true },
    { prop: 'batteryLevel', name: 'COMMON.BATTERY', sortable: true, resizeable: true },
    { prop: 'appVersion', name: 'VERSION', sortable: true, resizeable: true },
  ];

  loadingIndicator = false;
  readonly headerHeight = 50;
  readonly rowHeight = 50;
  readonly footerHeight = 50;
  readonly pageLimit = 10;
  private pageCount = 0;

  private _unsubscribeAll: Subject<any> = new Subject();

  constructor(
    private _router: Router,
    private _deviceService: DeviceService,
    private el: ElementRef,
    private _matSnackBar: MatSnackBar,
    private _fuseProgressBarService: FuseProgressBarService,
    private _configService: ConfigService,
    private _translate: TranslatePipe,

  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.onScroll = _.debounce(this.onScroll, 200);
  }

  fetchData() {
    this.updateTableData();
  }

  onClickActiveStatus(item, event: PointerEvent, index) {
    event.stopImmediatePropagation();
    this.activeListSelection[index].selected = !this.activeListSelection[index].selected;
  }

  private updateTableData(filterType?: string) {
    // this.loadingIndicator = true;

    if (filterType !== 'pagination') {
      this.pageCount = 0;
      this.filters.skip = 0;
    }

    // 
    delete this.filters.properties;
    delete this.filters.types;

    const filters = { 
      // ...this.filters, 
      ...this.sortFilters,
      company: this._configService.config.company
    }
    

    this._fuseProgressBarService.show();
    this._deviceService.getAllDevices(filters).then(
      (data: any) => {
        this.totalCount = data?.results?.length;
        
        if (filterType == 'pagination') {
          this.rows = [...this.rows, ...data.results];
        } else {
          this.rows = data.results;
        }
      },
      (err) => {
      }
    ).finally(() => {
      this._fuseProgressBarService.hide();
      // this.loadingIndicator = false;
    })
    
    ;
  }

  onClickBack() {
    this._router.navigate([ReportUrls.Timesheets]);
  }

  onSort(event) {
    const sort: {dir: string, prop: string} = event.sorts && event.sorts.length > 0 ? Object.assign({},event.sorts[0]) : '';
    if (!sort) return;
    // mapping the name to column
    const col = this.columns.find(x => this._translate.transform(x.name)?.toLowerCase()  == event?.column?.name?.toLowerCase());

    // changing prop names 
    sort.prop = sort.prop.toLowerCase();
    sort.prop = col.prop ? <string>col.prop : sort.prop;

    // setting the filters
    this.sortFilters.sort = [sort.prop]
    this.sortFilters.sortOrder = [sort.dir];
    this.updateTableData();
  }

  onScroll(event) {
    return; // temporary till api is remained.

    let offsetY = event?.target?.scrollTop;
    const clientHeight = event?.srcElement?.clientHeight;

    const isScrollEnd =
      offsetY + clientHeight + this.headerHeight + this.footerHeight + 100 >= this.rows.length * 45;

    
    // check if we scrolled to the end of the viewport
    if (!this.loadingIndicator && isScrollEnd) {
      this.pageCount += 1;
      this.filters.skip = this.filters.limit * this.pageCount;
      this.updateTableData('pagination');
    }
  }

  download(type: string) {
    return; // temporary till api is remained.
    const filters = { ...this.filters };

    filters.reports = [type];
    filters.skip = 0;
    filters.limit = 0;

    this._fuseProgressBarService.show();
    // NOTE: API is remaining
    // this._deviceService
    //   .getSpreadSheetEmployee(filters)
    //   .then((res: any) => {
    //     

    //     let url = '';
    //     if (type == 'pdf') {
    //       url = res?.pdfURL;
    //     } else if (type == 'csv') {
    //       url = res?.csvURL;
    //     } else if (type == 'excel') {
    //       url = res?.excelURL;
    //     }

    //     if (url) {
    //       this.downloadURL(url);
    //       this._matSnackBar.open(`Success : Download should begin automatically`, 'OK', {
    //         verticalPosition: 'bottom',
    //         duration: 5000,
    //         panelClass: ['accent'],
    //       });
    //     } else {
    //       this._matSnackBar.open(`Something went wrong.`, 'OK', {
    //         verticalPosition: 'bottom',
    //         duration: 5000,
    //         panelClass: ['warn'],
    //       });
    //     }
    //   })
    //   .catch((err) => {})
    //   .finally(() => {
    //     // this.filters.reports = [];
    //     this._fuseProgressBarService.hide();
    //   });
  }

  downloadURL(url: string) {
    const link = document.createElement('a');
    link.setAttribute('download', url);
    link.setAttribute('href', url);
    document.body.appendChild(link);
    window.open(url, '_blank');
    // link.click();
    link.remove();
  }
}
