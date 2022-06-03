export class Flag {
  isFeatureFlagsEnabled: string;
  isPortalReportEmployeeEnabled: string;
  isPortalReportClientEnabled: string;
  isPortalReportImagesEnabled: string;
  isPortalReportDeviceListEnabled: string;
  isPortalReportPackagesEnabled: string;
  isPortalReportPayEnabled: string;

  constructor(flag) {
    this.isFeatureFlagsEnabled = flag.isFeatureFlagsEnabled;
    this.isPortalReportEmployeeEnabled = flag.isPortalReportEmployeeEnabled;
    this.isPortalReportClientEnabled = flag.isPortalReportClientEnabled;
    this.isPortalReportImagesEnabled = flag.isPortalReportImagesEnabled;
    this.isPortalReportDeviceListEnabled = flag.isPortalReportDeviceListEnabled;
    this.isPortalReportPackagesEnabled = flag.isPortalReportPackagesEnabled;
    this.isPortalReportPayEnabled = flag.isPortalReportPayEnabled;
  }
}
