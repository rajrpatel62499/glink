import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-figma-privacy-agreement',
  templateUrl: './figma-privacy-agreement.component.html',
  styleUrls: ['./figma-privacy-agreement.component.scss'],
})
export class FigmaPrivacyAgreementComponent implements OnInit {
  logoUrl = '';
  company = '';

  constructor() {}

  ngOnInit(): void {}
}
