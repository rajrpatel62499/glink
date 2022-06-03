import {
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ConfigService } from 'app/store/services/config.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'privacy-agreement',
  templateUrl: './privacy-agreement.component.html',
  styleUrls: ['./privacy-agreement.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class PrivacyAgreementComponent implements OnInit {
  logoUrl = '';

  /**
   * Constructor
   *
   * @param {FuseConfigService} _fuseConfigService
   */
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _configService: ConfigService
  ) {
    this.logoUrl = `https://g-link-media.s3.amazonaws.com/app-assets/portal/logos/${_configService.config.server}-small.png`;

    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true,
        },
        toolbar: {
          hidden: true,
        },
        footer: {
          hidden: true,
        },
        sidepanel: {
          hidden: true,
        },
      },
    };
  }

  ngOnInit(): void {}
}
