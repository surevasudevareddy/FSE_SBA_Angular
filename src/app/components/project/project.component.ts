import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ProjectServiceService } from 'src/app/services/project-service.service';
import { Project } from 'src/app/shared/model/project';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatDialogConfig } from '@angular/material';
import { NotificationService } from 'src/app/services/notification.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import * as _ from 'lodash';
import { FormGroupDirective } from '@angular/forms';

export interface UserData {
  userId: number;
  firstName: string;
}

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  @ViewChild(FormGroupDirective, {static: true}) myForm;
  listData: MatTableDataSource<Project>;
  displayedColumns: string[] = ['projectId','projectName','startDate', 'endDate', 'priority','user','tasksCount','completedTasks','actions'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  searchKey: string;

  userList: UserData[];

  constructor(private cdr: ChangeDetectorRef,private service : ProjectServiceService,private notificationService:NotificationService, private diolog : MatDialog,private userService:TaskManagerService) {
    this.loadUsers();
   }

  ngOnInit() {
    this.service.initilizeFormGroup();
    this.loadListData();    
  }
  onClear() {
    this.service.form.reset();
    this.service.initilizeFormGroup();    
  }
  onSubmit(formdata) {    
    formdata = _.omit(formdata,['userId','userName','checkDates']);
    if (this.service.form.valid) {
      let userId : string = this.service.form.get('userId').value
      if (!this.service.form.get('projectId').value){
          this.service.addProject(formdata,userId).subscribe(res=>{
          console.log("Add Project Response:"+res);
          this.refreshPage();
          this.notificationService.success(':: Submitted successfully');
        });
      }else{
          this.service.updateProject(formdata,userId).subscribe(res=>{
          this.refreshPage();
          this.notificationService.success(':: Updated successfully');
        });
      }
    }
  }
  refreshPage(){
      this.service.form.reset();
      this.restFormErros();
      this.service.initilizeFormGroup();
      this.loadListData();
  }
  onEdit(row){    
    this.service.populateForm(row);  
  }
  onDelete($key){
    if(confirm('Are you sure to delete this record ?')){
    this.service.deleteProject($key).subscribe(res =>{
      console.log("User got deleted");
      this.loadListData();
    });
    this.notificationService.warn('! Deleted successfully');
    }
  }
  loadListData(){
    this.service.getProjects().subscribe(projects => {      
      console.log("getProjects:"+projects);
      this.listData = new MatTableDataSource<Project>(projects);
      this.cdr.detectChanges();
      this.listData.sort = this.sort;
      this.listData.paginator =this.paginator;
      //the below code is needed to exclude the colum from the filter but show how not working if added usereId
      // this.listData.filterPredicate = (data, filter) => {
      //   return this.displayedColumns.some(ele => {
      //     return ele != 'actions' && data[ele].toLowerCase().indexOf(filter) != -1;
      //   });
      // };
     })  
  }
  onSearchClear() {
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.listData.filter = this.searchKey.trim().toLowerCase();
  }
  enableDates(value){
    console.log("logevent");
    console.log(this.service.form.controls['checkDates'].value);
    if(!this.service.form.controls['checkDates'].value){
      this.service.form.controls['startDate'].setValue('');
      this.service.form.controls['endDate'].setValue('');
      this.service.form.controls['startDate'].disable();
      this.service.form.controls['endDate'].disable();
    }else{
      let maxToDate = new Date();
      maxToDate.setDate(new Date().getDate()+1);
      this.service.form.controls['startDate'].enable();
      this.service.form.controls['endDate'].enable();
      this.service.form.controls['startDate'].setValue(new Date());
      this.service.form.controls['endDate'].setValue(maxToDate);
      
    }
    console.log("logevent END");
  }
  loadUsers(){
    this.userService.getUsers().subscribe(users => {      
    console.log("getUSer:"+users);
    let array:UserData[] = users.map(user=>{
      return {
        userId: user.userId,
        firstName: user.firstName+' '+user.lastName,
      };
    });
    this.userList = array;
  });
}
  empSearch(){
    console.log("loading dialog"+JSON.stringify(this.userList));
    const diologConfig : MatDialogConfig = new MatDialogConfig();
    diologConfig.disableClose = false;
    diologConfig.autoFocus = true;
    diologConfig.width = "40%";
    diologConfig.data = {'data':this.userList,'title':'Project'};
    const dialogRef = this.diolog.open(UserDialogComponent,diologConfig);
    dialogRef.afterClosed().subscribe(user =>{      
      if(user){
        this.service.form.controls['userId'].setValue(user.userId);  
        this.service.form.controls['userName'].setValue(user.firstName);    
      }
    });    
  }
  restFormErros(){
    if(this.myForm){
      this.myForm.resetForm();
    }
  }
}
