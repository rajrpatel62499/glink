import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-figma-privacy-agreement-content-en-fr',
  templateUrl: './figma-privacy-agreement-content-en-fr.component.html',
  styleUrls: ['./figma-privacy-agreement-content-en-fr.component.scss']
})
export class FigmaPrivacyAgreementContentEnFrComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public navigateToSection(section: string) {
    window.location.hash = '';
    window.location.hash = section;
}

}
