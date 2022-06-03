import { TranslatePipe } from '@ngx-translate/core';
import { ReportUrls, SortFilters } from './../timesheet-model';
import { Employee } from './../../../employee/models/employee.model';
import { TimeSheetService } from './../timesheet.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, ElementRef, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { User } from 'app/main/apps/user/user.model';
import { DateUtils, DATE_FORMATS, TimeSheetEmployee, ReportFilters } from '../timesheet-model';
import { ALocation } from 'app/main/apps/location/location.model';
import * as moment from 'moment';
import { ColumnMode, TableColumn } from '@swimlane/ngx-datatable';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';

@Component({
  selector: 'app-employee-timesheet',
  templateUrl: './employee-timesheet.component.html',
  styleUrls: ['./employee-timesheet.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe]
})
export class EmployeeTimesheetComponent implements OnInit {
  header = {
    title: 'COMMON.REPORTS',
    path: 'COMMON.OPERATIONS',
    subpath: 'COMMON.EMPLOYEES',
  };


  range = new FormGroup(
    {
      start: new FormControl(DateUtils.monthStartDate, Validators.required),
      end: new FormControl(DateUtils.today, Validators.required),
    },
    Validators.required
  );

  byDefaultSelection = false;

  bannersGroup: any = [];
  bannerSelections: any = [];

  users: User[] = [];
  locations: ALocation[] = [];
  clientsSelections: { value: string; selected: boolean; data: ALocation }[] = [];


  get employees(): Employee[] {
    return this.employeeSelections.map((employee) => employee.data);
  }

  employeeSelections: { value: string; selected: boolean; data: Employee }[] = [];

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
  rows: TimeSheetEmployee[] = [];

  columns: TableColumn[] = [
    { prop: 'timesheetDate', name: 'DATE', sortable: false, resizeable: true},
    { prop: 'propertyName', name: 'COMMON.CLIENT', sortable: false, resizeable: true },
    { prop: 'employeeFirst', name: 'COMMON.EMPLOYEES', sortable: false, resizeable: true },
    { prop: 'time', name: 'COMMON.TIME', sortable: false, resizeable: true },
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
    private el: ElementRef,
    private _matSnackBar: MatSnackBar,
    private _fuseProgressBarService: FuseProgressBarService,
    private _translate: TranslatePipe,
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.onScroll = _.debounce(this.onScroll, 200);
  }


  fetchData() {
    this._timeSheetService.onLocationsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: ALocation[]) => {
        this.locations = data;
        this.clientsSelections = data.map((x) => {
          return { value: x.name, selected: this.byDefaultSelection, data: x };
        });

        // this.employees = [...this._timeSheetService.getEmployeesByLocationIds(this.clients.map(x => x._id))] ;
        const employees = this._timeSheetService.getEmployeesByLocationIds(
          this.locations.map((x) => x._id)
        );
        this.employeeSelections = [
          ...employees.map((x) => {
            return { value: `${x.first} ${x.last}`, selected: this.byDefaultSelection, data: x };
          }),
        ];

        this.updateTableData();
      });

      this._timeSheetService.onClientsListChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((users: User[]) => {
        this.users = users;
        // const usersGroupRaw = _.mapValues(_.groupBy(users, 'banner'));
        const usersGroupRaw = _.mapValues(_.groupBy(users, 'banner'));
        this.bannersGroup = this.cleanForEmptyBanner(usersGroupRaw);

        // NOTE: here client(user) to location mapping require to send the fetch the employees based on location id. 
        Object.keys(this.bannersGroup).forEach(key => {
          const usersList: User[] = this.bannersGroup[key];
          this.bannersGroup[key] = usersList.map(user => {
            return this.locations.find(x => x.property._id == user._id);
          }).filter(x => !!x);
        })

        this.bannerSelections = Object.keys(this.bannersGroup).map((key) => {
          return { value: key, selected: this.byDefaultSelection, data: this.bannersGroup[key] };
        });

        // this.clients = users;
        // this.clientSelections = this.generateClientSelectionsFromBanners(this.bannerSelections);
      });
  }



  onClientDropdownClose(selectedClientsSelections: any[]) {
    const clients = selectedClientsSelections.map((item) => item.data);

    const newEmployees = this._timeSheetService.getEmployeesByLocationIds(
      clients.map((x) => x._id)
    );

    const prevEmployeeSelections = _.cloneDeep(this.employeeSelections);

    const newEmployeeSelections = [
      ...newEmployees.map((x) => {
        return { value: `${x.first} ${x.last}`, selected: this.byDefaultSelection, data: x };
      }),
    ];

    // if previous selection has the selected true then we set it to the new employee selection selected true
    newEmployeeSelections.forEach((empSelection) => {
      prevEmployeeSelections.forEach((x) => {
        if (x.data._id == empSelection.data._id) {
          empSelection.selected = x.selected;
        }
      });
    });

    const data = _.uniqBy(newEmployeeSelections, (e) => {
      return e.data._id;
    });
    this.employeeSelections = data;

    this.updateTableData();
  }

  onEmployeeDropdownClose(selectedEmployeeSelections: any[]) {
    this.updateTableData();
  }

  onBannerSelectionChange(banners: any[]) {
    const newClientSelections = this.generateClientSelectionsFromBanners(banners);
    const prevEmployeeSelections = _.cloneDeep(this.clientsSelections);

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
    this.clientsSelections = data;
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

  onDatePickerClose(value) {
    if (value.start && value.end) {
      this.filters.startDate = moment(value.start).format(DATE_FORMATS.TimeSheet);
      this.filters.endDate = moment(value.end).format(DATE_FORMATS.TimeSheet);
      this.updateTableData();
    }
  }

  private updateTableData(filterType?: string) {
    const employees = this.employeeSelections.filter((x) => x.selected).map((item) => item.data);
    const locations = this.clientsSelections.filter((x) => x.selected).map((item) => item.data);
    
    const empIds = employees.map((x) => x._id);
    const locationIds = locations.map((x) => x._id);

    this.filters.employees = empIds || [];
    this.filters.locations = locationIds || [];

    if (filterType !== 'pagination') {
      this.pageCount = 0;
      this.filters.skip = 0;
    }

    
    delete this.filters.properties;
    delete this.filters.types;

    Object.assign(this.filters, {...this.filters, ...this.sortFilters});

    this._fuseProgressBarService.show();
    this._timeSheetService.getSpreadSheetEmployee(this.filters).then(
      (data: any) => {
        this.totalTime = data?.total;

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

  onClickBack() {
    this._router.navigate([ReportUrls.Timesheets]);
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
    
    const filters = {...this.filters};
    
    filters.reports = [type];
    filters.skip = 0;
    filters.limit = 0;

    this._fuseProgressBarService.show();
    this._timeSheetService
      .getSpreadSheetEmployee(filters)
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

  downloadURL(url: string) {
    const link = document.createElement('a');
    link.setAttribute('download', url);
    link.setAttribute('href', url);
    document.body.appendChild(link);
    window.open(url, "_blank");
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
}
