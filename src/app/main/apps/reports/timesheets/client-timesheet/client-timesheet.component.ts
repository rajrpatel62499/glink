import { ReportUrls, SortFilters } from './../timesheet-model';
import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { TimeSheetService } from '../timesheet.service';
import { User } from 'app/main/apps/user/user.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import {
  DateUtils,
  DATE_FORMATS,
  TimeSheetClient,
  ReportFilters,
} from '../timesheet-model';
import * as moment from 'moment';
import { ColumnMode, TableColumn } from '@swimlane/ngx-datatable';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-client-timesheet',
  templateUrl: './client-timesheet.component.html',
  styleUrls: ['./client-timesheet.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe]
})
export class ClientTimesheetComponent implements OnInit {
  header = {
    title: 'COMMON.REPORTS',
    path: 'COMMON.OPERATIONS',
    subpath: 'COMMON.CLIENTS',
  };

  @ViewChild("dateTemplate") dateTemplate: TemplateRef<any>;


  range = new FormGroup(
    {
      start: new FormControl(DateUtils.monthStartDate, Validators.required),
      end: new FormControl(DateUtils.today, Validators.required),
    },
    Validators.required
  );

  byDefaultSelection = false;

  clients: User[] = [];
  clientSelections: { value: string; selected: boolean; data: User }[] = [];

  bannersGroup: any = [];
  bannerSelections: any = [];

  timeSheetClients: TimeSheetClient[] = [];
  private _totalTime: string = '0.00';

  get totalTime() {
    return this._totalTime;
  }

  set totalTime(value) {
    if (value) {
      this._totalTime = Number.parseFloat(value).toFixed(2);
    } else {
      this._totalTime = '0.00';
    }
  }


  filters: ReportFilters = new ReportFilters();
  sortFilters = new SortFilters();

  ColumnMode = ColumnMode;
  rows: TimeSheetClient[] = [];
  columns: TableColumn[] = [
    // { prop: 'timesheetDate', name: 'Date', sortable: false, resizeable: true},
    { $$id: '1', prop: 'banner', name: 'COMMON.BANNER', sortable: false, resizeable: true },
    { $$id: '2', prop: 'propertyName', name: 'COMMON.CLIENT', sortable: false, resizeable: true },
    { $$id: '3', prop: 'time', name: 'COMMON.TIME', sortable: false, resizeable: true },
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
    private _timeSheetService: TimeSheetService,
    private _matSnackBar: MatSnackBar,
    private _fuseProgressBarService: FuseProgressBarService, 
    private _translate: TranslatePipe,
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.onScroll = _.debounce(this.onScroll, 200);
  }

  
  ngAfterViewInit() {
    // this.columns[0].cellTemplate = this.dateTemplate;
  }
  
  fetchData() {
    this._timeSheetService.onClientsListChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((users: User[]) => {
        // const usersGroupRaw = _.mapValues(_.groupBy(users, 'banner'));
        const usersGroupRaw = _.mapValues(_.groupBy(users, 'banner'));
        this.bannersGroup = this.cleanForEmptyBanner(usersGroupRaw);
        this.bannerSelections = Object.keys(this.bannersGroup).map((item) => {
          return { value: item, selected: this.byDefaultSelection, data: this.bannersGroup[item] };
        });

        this.clients = users;
        this.clientSelections = this.generateClientSelectionsFromBanners(this.bannerSelections);
      });

    this.updateTableData();
  }

  onClickBack() {
    this._router.navigate([ReportUrls.Timesheets]);
  }

  onBannerSelectionChange(banners: any[]) {
    const newClientSelections = this.generateClientSelectionsFromBanners(banners);
    const prevEmployeeSelections = _.cloneDeep(this.clientSelections);

    newClientSelections.forEach((clientSelection) => {
      prevEmployeeSelections.forEach((x) => {
        if (x.data._id == clientSelection.data._id) {
          clientSelection.selected = x.selected;
        }
      });
    });

    const data = _.uniqBy(newClientSelections, (e) => {
      return e.data._id;
    });
    this.clientSelections = data;
  }

  private generateClientSelectionsFromBanners(banners: any[]) {
    var newClientSelections = [];
    banners.forEach((banner) => {
      const groupUsers = this.bannersGroup[banner.value];

      groupUsers.forEach((user) => {
        newClientSelections.push({
          value: `${user.name}`,
          selected: this.byDefaultSelection,
          data: user,
        });
      });
    });
    return newClientSelections;
  }

  private updateTableData(filterType?: string) {
    const clients = this.clientSelections.filter((x) => x.selected).map((item) => item.data);
    const clientIds = clients.map((x) => x._id);

    this.filters.properties = clientIds || [];

    if (filterType !== 'pagination') {
      this.pageCount = 0;
      this.filters.skip = 0;
    }

    

    delete this.filters.employees;
    delete this.filters.locations;
    delete this.filters.types;

    Object.assign(this.filters, {...this.filters, ...this.sortFilters});

    this._fuseProgressBarService.show();
    this._timeSheetService.getSpreadSheetClient(this.filters).then(
      (data: any) => {
        this.totalTime = data?.total;

        if (filterType == 'pagination') {
          this.rows = [...this.rows, ...data.clients];
        } else {
          this.rows = data.clients;
        }
      }
     
    )
    .catch(err => {
      
    })
    .finally(() => {
      this._fuseProgressBarService.hide();
    });
  }

  onClientDropownClose($event) {
    this.updateTableData();
  }

  onDatePickerClose(value) {
    if (value.start && value.end) {
      this.filters.startDate = moment(value.start).format(DATE_FORMATS.TimeSheet);
      this.filters.endDate = moment(value.end).format(DATE_FORMATS.TimeSheet);
      this.updateTableData();
    }
  }

  onScroll(event) {
    let offsetY = event?.target?.scrollTop;
    const clientHeight = event?.srcElement?.clientHeight;


    // console.log(
    //   `${
    //     offsetY + clientHeight + this.headerHeight + this.footerHeight >=
    //     this.rows.length * this.rowHeight
    //   }`
    // );
    const isScrollEnd =
      offsetY + clientHeight + this.headerHeight + this.footerHeight + 100 >=
      this.rows.length * 45;

    

    // check if we scrolled to the end of the viewport
    if (!this.loadingIndicator && isScrollEnd) {
      this.pageCount += 1;
      this.filters.skip = this.filters.limit * this.pageCount;
      this.updateTableData('pagination');
    }
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


  download(type: string) {
    const filters = { ...this.filters };

    filters.reports = [type];
    filters.skip = 0;
    filters.limit = 0;

    this._fuseProgressBarService.show();
    this._timeSheetService
      .getSpreadSheetClient(filters)
      .then((res: any) => {
        

        let url = '';
        if (type == 'pdf') {
          url = res?.pdfURL;
        } else if (type == 'csv') {
          url = res?.csvURL;
        } else if (type == 'excel') {
          url = res?.excelURL;
        }

        if (url) {
          this.downloadURL(url);
          this._matSnackBar.open(`Success : Download should begin automatically`, 'OK', {
            verticalPosition: 'bottom',
            duration: 5000,
            panelClass: ['accent'],
          });
        } else {
          this._matSnackBar.open(`Something went wrong.`, 'OK', {
            verticalPosition: 'bottom',
            duration: 5000,
            panelClass: ['warn'],
          });
        }
      })
      .catch((err) => {})
      .finally(() => {
        // this.filters.reports = [];
        this._fuseProgressBarService.hide();
      });
  }

  //#region Util
  downloadURL(url: string) {
    const link = document.createElement('a');
    link.setAttribute('download', url);
    link.setAttribute('href', url);
    document.body.appendChild(link);
    window.open(url, '_blank');
    // link.click();
    link.remove();
  }

  private cleanForEmptyBanner(dict: any): any {
    var cleaned = {};
    for (var key in dict) {
      if (key !== '') {
        cleaned[key] = dict[key];
      }
    }
    return cleaned;
  }
  //#endregion
}
