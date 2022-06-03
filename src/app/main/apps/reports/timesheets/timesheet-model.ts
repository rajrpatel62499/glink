import * as moment from "moment";

export const DATE_FORMATS = {
    TimeSheet : 'YYYY-MM-DDTHH:mm:ss.ssZ'
};

export const DateFrequency = {
    BI_WEEKLY: 'REPORTS.BI_WEEKLY',
    WEEKLY: 'REPORTS.WEEKLY',
    WEEK_COUNT: 6,
    BI_WEEK_COUNT: 13
}


export const DateUtils = {
    monthStartDate : moment().startOf('month').format(DATE_FORMATS.TimeSheet),
    monthEndDate:  moment().endOf('month').format(DATE_FORMATS.TimeSheet),
    today: moment().format(DATE_FORMATS.TimeSheet),
    afterWeek: moment().add(DateFrequency.WEEK_COUNT, "days").format(DATE_FORMATS.TimeSheet),
    afterBIWeek: moment().add(DateFrequency.BI_WEEK_COUNT, "days").format(DATE_FORMATS.TimeSheet),
    startOfWeek: moment().startOf("week").format(DATE_FORMATS.TimeSheet),
    endOfWeek: moment().endOf("week").format(DATE_FORMATS.TimeSheet),
    endOfNextWeek: moment().add(1, "weeks").endOf("week").format(DATE_FORMATS.TimeSheet),
}


export interface TimeSheetEmployee {
    propertyName: string;
    employeeFirst: string;
    employeeLast: string;
    time: string;
    employeeId: string;
}
export interface TimeSheetClient {
    banner: string;
    propertyName: string;
    time: string;
    propertyId: string;
}

export class SortFilters {
    sort: string[] = [];
    sortOrder: string[] = [];
}

export class ReportFilters {
    startDate?: string = DateUtils.monthStartDate;
    endDate?: string = DateUtils.today;
    employees?: string[] = [];
    locations?: string[] = []; 
    properties?: string[] = [];
    types?: string[] = [];
    skip?: number = 0;
    limit?: number = 50 ;
    timezone?: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    categories?:string[]
    reports?: string[] = []; // excel | csv | pdf
    
    constructor(filters?: ReportFilters) {

        if (filters) {
            const { startDate, endDate } = filters;
    
            startDate? this.startDate = startDate : '';
            endDate? this.endDate = endDate : '';

        }
    }
}

export const ReportUrls = {
    "Timesheets" : "apps/reports/operations",
    "Employee" : "apps/reports/operations/employee",
    "Client" : "apps/reports/operations/client",
    "PictureExtraction" : "apps/reports/operations/picture-extraction",
    "Devices" : "apps/reports/operations/devices",

    "Payrolls" : "apps/reports/payrolls",
    "PayrollExport" : "apps/reports/payrolls/finance",
    
}
