import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatDialogConfig, MatDialog } from '@angular/material';
import { Task } from 'src/app/shared/model/task';
import { TaskServiceService } from 'src/app/services/task-service.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserData } from '../project/project.component';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { ProjectServiceService } from 'src/app/services/project-service.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {
  listData: MatTableDataSource<Task>;
  displayedColumns: string[] = ['taskName','parentTaskName','priority', 'startDate','endDate', 'actions'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  searchKey: string;
  projectName : string;
  projectList : UserData[];
  constructor(private service : TaskServiceService,private notificationService:NotificationService,private dialog : MatDialog,private projectService :ProjectServiceService) {
   } 

  ngOnInit() {
    this.loadListData(0);
    this.loadProjects();
  }
  searchTasks(){
    this.searchProject();
  }
  searchProject(){
    const dialogRef = this.openDialog(this.projectList, 'Project');
    dialogRef.afterClosed().subscribe(project =>{

      if(project){
        this.projectName= project.firstName;  
        this.loadListData(project.userId)
      }
    });    
  }
  openDialog(data : UserData[],title:string){

    const diologConfig : MatDialogConfig = new MatDialogConfig();
    diologConfig.disableClose = false;
    diologConfig.autoFocus = true;
    diologConfig.width = "40%";
    diologConfig.data = {'data':data,'title':title};
    return this.dialog.open(UserDialogComponent,diologConfig);
}

  loadListData(projectId :number){
    if(projectId){
      this.service.getTasksByProjectId(projectId).subscribe(tasks => {      

        this.listData = new MatTableDataSource<Task>(tasks);
        this.listData.sort = this.sort;
        this.listData.paginator =this.paginator;
        //the below code is needed to exclude the colum from the filter but show how not working if added usereId
        // this.listData.filterPredicate = (data, filter) => {
        //   return this.displayedColumns.some(ele => {
        //     return ele != 'actions' && data[ele].toLowerCase().indexOf(filter) != -1;
        //   });
        // };
       })
    }else{
    this.service.getTasks().subscribe(tasks => {      

      this.listData = new MatTableDataSource<Task>(tasks);
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
  }
  onSearchClear() {
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter() {
    this.listData.filter = this.searchKey.trim().toLowerCase();
  }

  onEndTask(row){
    if(confirm('Are you sure to End this Task ?')){
      let parentId = row.parentTask.parentId;
      let projectId = row.project.projectId;
      let userId = row.user.userId;
      row = _.omit(row,['parentTask','project','user']);
      row = _.extend(row,{status : 'CMP'});

    this.service.updateTask(row,parentId,projectId,userId).subscribe(res =>{

      this.notificationService.warn('! Task status changed to END successfully');
      this.loadListData(0);
    });
    }
  }
  loadProjects(){
    this.projectService.getProjects().subscribe(projects => {      

    let array:UserData[] = projects.map(project=>{
      return {
        userId: project.projectId,
        firstName: project.projectName,
      };
    });
    this.projectList = array;
    });
  }
}
