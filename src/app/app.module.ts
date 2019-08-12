import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from "./material/material.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ProjectComponent } from './components/project/project.component';
import { UserComponent } from './components/user/user.component';
import { TaskComponent } from './components/task/task.component';
import { HttpClientModule } from '@angular/common/http';
import { UserDialogComponent } from './components/user-dialog/user-dialog.component';
import { MatSelectSearchModule } from './mat-select-search/mat-select-search.module';
import { DatePipe } from '@angular/common';
import { ViewTaskComponent } from './components/view-task/view-task.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    NavBarComponent,
    ProjectComponent,
    UserComponent,
    TaskComponent,
    UserDialogComponent,
    ViewTaskComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectSearchModule,
  ],
  exports:[
    // Mat-select-search
    MatSelectSearchModule,
  ],
  providers: [DatePipe,],
  entryComponents: [
    UserDialogComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
