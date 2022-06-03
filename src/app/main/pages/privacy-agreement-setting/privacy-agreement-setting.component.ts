import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-privacy-agreement-setting',
  templateUrl: './privacy-agreement-setting.component.html',
  styleUrls: ['./privacy-agreement-setting.component.scss'],
  animations: fuseAnimations,
})
export class PrivacyAgreementSettingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
