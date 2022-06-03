import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'figma-table',
  templateUrl: './figma-table.component.html',
  styleUrls: ['./figma-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FigmaTableComponent implements OnInit {

  displayedColumns: string[] = [];
  get columnsToDisplay(): any[] {  return this.displayedColumns.slice(); }

  
  keyHeaderMap: Map<string,string>;
  @Input('keyHeaderMap')
  set setKeyHeaderMap(value) {
    this.keyHeaderMap = value;
    this.displayedColumns = Array.from(this.keyHeaderMap.keys());
  }

  
  @Input() data: any[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
