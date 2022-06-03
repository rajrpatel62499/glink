import { TranslatePipe } from '@ngx-translate/core';
import {
  DateFrequency,
  DATE_FORMATS,
  ReportFilters,
  TimeSheetClient,
  TimeSheetEmployee,
  DateUtils,
  ReportUrls,
  SortFilters,
} from './../../timesheets/timesheet-model';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { PayrollService } from '../payroll.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { User } from 'app/main/apps/user/user.model';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ColumnMode, TableColumn } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  providers: [TranslatePipe]
})
export class PayrollComponent implements OnInit, OnDestroy {
  header = {
    title: 'COMMON.REPORTS',
    path: 'REPORTS.FINANCE.NAME',
    subpath: 'REPORTS.FINANCE.EXPORT_PAYROLL',
  };

  payrollForm: FormGroup;
  frequencies = [DateFrequency.WEEKLY, DateFrequency.BI_WEEKLY];
  selectedFrequency: string = this._payrollService.frequency;

  bannersGroup: any = [];
  bannerSelections: any = [];
  clientSelections: any = [];
  byDefaultSelection = false;

  // calendar items
  minDate = new Date('2021/01/01');
  maxDate = new Date();
  selected: any;
  selectedEndPayload: any;

  range = new FormGroup(
    {
      start: new FormControl(DateUtils.startOfWeek, Validators.required),
      end: new FormControl(this.endDate, Validators.required),
    },
    Validators.required
  );

  private _unsubscribeAll: Subject<any>;

  filters: ReportFilters = new ReportFilters({
    startDate: DateUtils.startOfWeek,
    endDate: this.endDate,
  });
  sortFilters = new SortFilters();


  get endDate() {
    return this._payrollService.frequency == DateFrequency.BI_WEEKLY ? DateUtils.endOfNextWeek : DateUtils.endOfWeek
  }

  ColumnMode = ColumnMode;
  rows: TimeSheetEmployee[] = [];
  columns: TableColumn[] = [
    // { prop: 'timesheetDate', name: 'Date', sortable: false, resizeable: true},
    { prop: 'client', name: 'COMMON.CLIENT', sortable: false, resizeable: true },
    { prop: 'employeeFirst', name: 'COMMON.EMPLOYEE', sortable: false, resizeable: true },
    { prop: 'start', name: 'REPORTS.FINANCE.HIRE_START_DATE', sortable: false, resizeable: true },
    { prop: 'status', name: 'REPORTS.FINANCE.STATUS', sortable: false, resizeable: true },
  ];
  loadingIndicator = false;
  readonly headerHeight = 50;
  readonly rowHeight = 50;
  readonly footerHeight = 50;
  readonly pageLimit = 10;
  private pageCount = 0; 

  constructor(
    private _router: Router,
    private _payrollService: PayrollService,
    private _fuseProgressBarService: FuseProgressBarService,
    private _matSnackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _translate: TranslatePipe
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.fetchData();
    this.onScroll = _.debounce(this.onScroll, 200);
  }

  fetchData() {
    this._payrollService.onClientsListChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((users: User[]) => {
        const usersGroupRaw = _.mapValues(_.groupBy(users, 'banner'));
        this.bannersGroup = this.cleanForEmptyBanner(usersGroupRaw);
        this.bannerSelections = Object.keys(this.bannersGroup).map((item) => {
          return { value: item, selected: this.byDefaultSelection, data: this.bannersGroup[item] };
        });

        this.clientSelections = this.generateClientSelectionsFromBanners(this.bannerSelections);

        this.updateTableData();
      });

    this.payrollForm = this.createPayrollForm();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onClickFrequency(item, event: PointerEvent) {
    event.stopImmediatePropagation();
    this.selectedFrequency = item;
    this._payrollService.frequency = item;
    
  }

  onClickBack() {
    this._router.navigate([ReportUrls.Payrolls]);
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

  generateClientSelectionsFromBanners(banners: any[]) {
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

  onClientSearchChange(searchText: any) {
    // TODO: apply logic pending Raj
  }

  onDatePickerClose(value) {
    if (value.start && value.end) {
      this.filters.startDate = moment(value.start).format(DATE_FORMATS.TimeSheet);
      this.filters.endDate = moment(value.end).format(DATE_FORMATS.TimeSheet);
      this.updateTableData();
    }
  }

  onCalendarChange(date) {
    this.selected = date;
    this.selectedEndPayload = date;
  }

  createPayrollForm(): FormGroup {
    return this._formBuilder.group({
      freq: [
        {
          value: 'Bi-Weekly',
          disabled: false,
        },
        [],
      ],
    });
  }

  downloadCurrentSchedule(): void {

    const endDate = this.range.get("end").value;
    
    // if (!this.selectedEndPayload) {
    if (!endDate) {
      this._matSnackBar.open('Please select a date.', 'OK', {
        verticalPosition: 'bottom',
        duration: 5000,
        panelClass: ['warn'],
      });
      return;
    }

    const locationIds = this.clientSelections
      .filter((client) => !!client.selected)
      .map((client) => {
        return !!client.data && !!client.data.locations && client.data.locations.length > 0
          ? client.data.locations[0]._id
          : null;
      });
    var locations = _.compact(locationIds);

    if (locations.length == 0) {
      this._matSnackBar.open(`You need to select a location.`, 'OK', {
        verticalPosition: 'bottom',
        duration: 5000,
        panelClass: ['warn'],
      });
    }

    // const dateRangeEnd = this.selectedEndPayload ? this.selectedEndPayload : new Date();
    // const weeks = this.payrollForm.controls['freq'].value === 'Weekly' ? 1 : 2;
    
    const dateRangeEnd = endDate ?? new Date(); 
    const weeks = this.selectedFrequency == DateFrequency.WEEKLY ? 1: 2;

    this._fuseProgressBarService.show();
    this._payrollService
      .generateSpreadsheet({ dateRangeEnd, weeks, locations })
      .then((response) => {
        if (!response || response === '') {
          this._matSnackBar.open(`Something went wrong.`, 'OK', {
            verticalPosition: 'bottom',
            duration: 5000,
            panelClass: ['warn'],
          });
          return;
        }

        this.triggerExcelUrlClick(response);

        this._matSnackBar.open(`Success : Download should begin automatically`, 'OK', {
          verticalPosition: 'bottom',
          duration: 5000,
          panelClass: ['accent'],
        });
      })
      .catch((error) => {
        this._matSnackBar.open(`Something went wrong. ${JSON.stringify(error)}`, 'OK', {
          verticalPosition: 'bottom',
          duration: 5000,
          panelClass: ['warn'],
        });
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  // getAllLocationsFromBanners() {
  //   var clients = [];
  //   if (this.bannerSelected.length > 0) {
  //     // only select the selected banners' location

  //     this.bannerSelected.forEach((banner) => {
  //       const usergroup = this.bannersGroup[banner.value];
  //       usergroup.forEach((user) => {
  //         clients.push(user.locations[0]._id);
  //       });
  //     });
  //   } else {
  //     // if no banner selected, range is for all locations
  //     for (const [key, value] of Object.entries(this.bannersGroup)) {
  //       const usergroup = value as User[];
  //       usergroup.forEach((user) => {
  //         clients.push(user.locations[0]._id);
  //       });
  //     }
  //   }
  //   return clients;
  // }

  onFrequencyClose() {
    this.updateTableData();
  }

  onClientSelectionChange() {
    this.updateTableData();
  }

  private updateTableData(filterType?: string) {
    const locations = this.clientSelections.filter((x) => x.selected).map((item) => item.data);
    const locationIds = locations.map((x) => x._id);

    this.filters.properties = locationIds || [];


    if (filterType !== 'pagination') {
      this.pageCount = 0;
      this.filters.skip = 0;
    }

    // cleaning up the filters
    delete this.filters.employees;
    delete this.filters.reports;
    delete this.filters.locations;

    
    Object.assign(this.filters, {...this.filters, ...this.sortFilters});
    this._fuseProgressBarService.show();

    this._payrollService.getClientEmployees(this.filters).then(
      (data: any) => {
        // this.totalTime = data?.total;

        if (filterType == 'pagination') {
          this.rows = [...this.rows, ...data.employees];
        } else {
          this.rows = data.employees;
        }

      }
    )
    .catch(err => {
      
    })
    .finally(() => {
      this._fuseProgressBarService.hide();
    });
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
      offsetY + clientHeight + this.headerHeight + this.footerHeight + 100 >= this.rows.length * 45;

    
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


  dateFilter = (d: Date | null): boolean => {
    const day = (new Date(d) || new Date()).getDay();
    return day === 6;
  };

  private triggerExcelUrlClick(url: string) {
    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.setAttribute('href', url);
    document.body.appendChild(link);
    link.click();
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

  private containsDeepSearchMatch(object: any, searchText: string): boolean {
    let isMatched = false;

    _.cloneDeepWith(object, (v, k) => {
      if (!!isMatched) {
        return;
      }

      const value = !!v && v.toString().toLowerCase();
      if (!!value && value.includes(searchText.toLowerCase())) {
        isMatched = true;
      }
    });
    return isMatched;
  }
}
