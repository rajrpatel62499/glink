import { TranslatePipe } from '@ngx-translate/core';
import { SortFilters } from './../timesheet-model';
import { FigmaImageGalleryComponent } from './../../../../ui/custom/figma-image-gallery/figma-image-gallery.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { ColumnMode, TableColumn } from '@swimlane/ngx-datatable';
import { Employee } from 'app/main/apps/employee/models/employee.model';
import { ALocation } from 'app/main/apps/location/location.model';
import { User } from 'app/store/states/user/user.model';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateUtils, ReportFilters, TimeSheetEmployee, DATE_FORMATS, ReportUrls } from '../timesheet-model';
import { TimeSheetService } from '../timesheet.service';
import { PictureExtractionService } from './picture-extraction.service';

@Component({
  selector: 'app-picture-extraction',
  templateUrl: './picture-extraction.component.html',
  styleUrls: ['./picture-extraction.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TranslatePipe]
})
export class PictureExtractionComponent implements OnInit {
  header = {
    title: 'COMMON.REPORTS',
    path: 'COMMON.OPERATIONS',
    subpath: 'COMMON.TASK_PICTURES',
  };


  range = new FormGroup(
    {
      start: new FormControl(DateUtils.monthStartDate, Validators.required),
      end: new FormControl(DateUtils.today, Validators.required),
    },
    Validators.required
  );

  byDefaultSelection = false;

  clients: ALocation[] = [];
  clientsSelections: { value: string; selected: boolean; data: ALocation }[] = [];


  get employees(): Employee[] {
    return this.employeeSelections.map((employee) => employee.data);
  }

  employeeSelections: { value: string; selected: boolean; data: Employee }[] = [];

  bannersGroup: any = [];
  bannerSelections: any = [];

  typeListSelections = [ 
    { id: 1, value: 'Messages', selected: true, data: 'MESSAGE'},
    { id: 2, value: 'Tasks', selected: true, data: 'TASK'},
  ]
  
  categoriesSelections = [
    { id: 1, value: 'Cleaning', selected: true },
    { id: 2, value: 'Carpets', selected: true },
    { id: 3, value: 'Offices', selected: true },
    { id: 4, value: 'Floors', selected: true },
    { id: 5, value: 'Front Desk', selected: true },
    { id: 6, value: 'Backstore', selected: true },
    { id: 7, value: 'Others', selected: true },
  ]
  private _totalPictures: string = '0';

  get totalPictures() {
    return this._totalPictures;
  }

  set totalPictures(value) {
    if (value) {
      this._totalPictures = Number.parseFloat(value).toFixed(0);
    } else {
      this._totalPictures = '0';
    }
  }

  filters: ReportFilters = new ReportFilters();
  sortFilters = new SortFilters();


  ColumnMode = ColumnMode;
  rows: TimeSheetEmployee[] = [];

  columns: TableColumn[] = [
    { prop: 'timesheetDate', name: 'COMMON.DATE_TIME', sortable: false, resizeable: true},
    { prop: 'client', name: 'COMMON.CLIENT', sortable: false, resizeable: true },
    { prop: 'title', name: 'COMMON.TITLE', sortable: false, resizeable: true },
    { prop: 'category', name: 'COMMON.CATEGORY', sortable: false, resizeable: true },
    { prop: 'images', name: 'PHOTOS', sortable: false, resizeable: true },
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
    private _pictureExtractionService: PictureExtractionService,
    private el: ElementRef,
    private _matSnackBar: MatSnackBar,
    private dialog: MatDialog,
    private _fuseProgressBarService: FuseProgressBarService,
    private _translate: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.onScroll = _.debounce(this.onScroll, 200);
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

      // this.clients = users;
      // this.clientSelections = this.generateClientSelectionsFromBanners(this.bannerSelections);
    });


    this._timeSheetService.onLocationsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: ALocation[]) => {
        this.clients = data;
        this.clientsSelections = data.map((x) => {
          return { value: x.name, selected: this.byDefaultSelection, data: x };
        });

        // this.employees = [...this._timeSheetService.getEmployeesByLocationIds(this.clients.map(x => x._id))] ;
        const employees = this._timeSheetService.getEmployeesByLocationIds(
          this.clients.map((x) => x._id)
        );
        this.employeeSelections = [
          ...employees.map((x) => {
            return { value: `${x.first} ${x.last}`, selected: this.byDefaultSelection, data: x };
          }),
        ];

        this.updateTableData();
      });
  }

  onBannerSelectionChange(banners: any[]) {
    const newClientSelections = this.generateClientSelectionsFromBanners(banners);
    const prevClientSelections = _.cloneDeep(this.clientsSelections);

    newClientSelections.forEach((clientSelection) => {
      prevClientSelections.forEach((x) => {
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

    // additional mapping to change the property data to location(client) data;
    newClientSelections.forEach(x => {
      const propertyId = x.data._id;
      const propertyIndex = this.clients.findIndex(x => x.property._id == propertyId);
      if (propertyIndex != -1)
        x.data = this.clients[propertyIndex];
    })
    return newClientSelections;
  }


  onClientDropdownClose(selectedClientsSelections: any[]) {
    const newEmployeeSelections = this.generateEmployeeSelectionsFromClients(selectedClientsSelections);

    const prevEmployeeSelections = _.cloneDeep(this.employeeSelections);
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

  
  private generateEmployeeSelectionsFromClients(selectedClientsSelections) {
    const clients = selectedClientsSelections.map((item) => item.data);

    const newEmployees = this._timeSheetService.getEmployeesByLocationIds(
      clients.map((x) => x._id)
    );

    
    const newEmployeeSelections = [
      ...newEmployees.map((x) => {
        return { value: `${x.first} ${x.last}`, selected: this.byDefaultSelection, data: x };
      }),
    ];

    return newEmployeeSelections;
  }

  onEmployeeDropdownClose(selectedEmployeeSelections: any[]) {
    this.updateTableData();
  }

  onDatePickerClose(value) {
    if (value.start && value.end) {
      this.filters.startDate = moment(value.start).format(DATE_FORMATS.TimeSheet);
      this.filters.endDate = moment(value.end).format(DATE_FORMATS.TimeSheet);
      this.updateTableData();
    }
  }

  private updateTableData(filterType?: string) {
    // return;
    const employees = this.employeeSelections.filter((x) => x.selected).map((item) => item.data);
    const properties = this.clientsSelections.filter((x) => x.selected).map((item) => item.data);
    const tasks = this.typeListSelections.filter((x) => x.selected).map((item) => item.data);
    const categories = this.categoriesSelections.filter((x) => x.selected).map((item) => item.value);
    
    const empIds = employees.map((x) => x._id);
    const propIds = properties.map((x) => x?.property?._id).filter(x => x);


    this.filters.employees = empIds || [];
    this.filters.properties = propIds || [];
    this.filters.types = tasks;
    this.filters.categories = categories;


    if (filterType !== 'pagination') {
      this.pageCount = 0;
      this.filters.skip = 0;
    }

    
    delete this.filters.locations;
    delete this.filters.reports;

    Object.assign(this.filters, {...this.filters, ...this.sortFilters});

    this._fuseProgressBarService.show();
    this._pictureExtractionService.getPictureData(this.filters).then(
      (data: any) => {
        
        this.totalPictures = data?.count;

        if (filterType == 'pagination') {
          this.rows = [...this.rows, ...data.tasks];
        } else {
          this.rows = data.tasks;
        }

      },
      (err) => {
      }, 
    ).finally(() => {
      this._fuseProgressBarService.hide();
    })
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

  openModal(pictureData) {

    let images = [];
    if (pictureData && pictureData.images) {
      images = pictureData.images;
    }

    const dialogRef = this.dialog.open(FigmaImageGalleryComponent, {
      height:'80vh',
      width: '80vw',
      data: {
        images: images
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      
    })
  }
}
