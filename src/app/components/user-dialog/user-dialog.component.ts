import { Component, OnInit, Inject, ViewChild, Optional } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UserData } from '../project/project.component';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { MatSelect } from '@angular/material';
import { takeUntil, take } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {
  
  @ViewChild('singleSelect', {static: true}) singleSelect: MatSelect;
  /** control for the selected bank */
  public userCtrl: FormControl = new FormControl();

   /** control for the MatSelect filter keyword */
  public userFilterCtrl: FormControl = new FormControl();
  /** list of banks filtered by search keyword */
  public filteredUsers: ReplaySubject<UserData[]> = new ReplaySubject<UserData[]>(1);
  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();
  private listData : UserData[];
  private title:string;
  
  constructor(@Optional() public dialogRef: MatDialogRef<UserDialogComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any) { 
    this.title = _.pick(this.data,['title']).title;
    this.listData = _.pick(this.data,['data']).data;
  }

  ngOnInit() {
    // set initial selection
    this.userCtrl.setValue(this.listData);

    // load the initial bank list
    this.filteredUsers.next(this.listData.slice());


    // listen for search field value changes
    this.userFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterUsers();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }
/**
   * Sets the initial value after the filteredUsers are loaded initially
   */
  private setInitialValue() {
    this.filteredUsers
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {          
        // setting the compareWith property to a comparison function 
        // triggers initializing the selection according to the initial value of 
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially 
        // and after the mat-option elements are available
        this.singleSelect.compareWith = (a: UserData, b: UserData) => a.firstName === b.firstName;
      });
  }

  private filterUsers() {
    if (!this.listData) {
      return;
    }
    // get the search keyword
    let search = this.userFilterCtrl.value;
    if (!search) {
      this.filteredUsers.next(this.listData.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredUsers.next(
      this.listData.filter(user => user.firstName.toLowerCase().indexOf(search) > -1)
    );
  }
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  
  close(): void{
    this.dialogRef.close();
  }
  
}
