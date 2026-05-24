import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from 'ionic-angular';
import { ExpandableSectionComponent } from './expandable-section/expandable-section.component';
import { AccessToggleComponent } from './access-toggle/access-toggle.component';
import { PillTabsComponent } from './pill-tabs/pill-tabs.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ListCardComponent } from './list-card/list-card.component';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { FabComponent } from './fab/fab.component';

import { GlassButtonComponent } from './glass-button/glass-button.component';
import { MapPickerComponent } from './map-picker/map-picker.component';
import { MapPickerModalComponent } from './map-picker/map-picker-modal.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { DetailHeaderComponent } from './detail-header/detail-header.component';
import { ProgressBarComponent } from './progress-bar/progress-bar';

@NgModule({
  declarations: [ExpandableSectionComponent, AccessToggleComponent, PillTabsComponent, SearchBarComponent, ListCardComponent, BottomSheetComponent, FabComponent, GlassButtonComponent, MapPickerComponent, FormFieldComponent, DetailHeaderComponent, ProgressBarComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [ExpandableSectionComponent, AccessToggleComponent, PillTabsComponent, SearchBarComponent, ListCardComponent, BottomSheetComponent, FabComponent, GlassButtonComponent, MapPickerComponent, FormFieldComponent, DetailHeaderComponent, ProgressBarComponent]
})
export class SharedComponentsModule {}
