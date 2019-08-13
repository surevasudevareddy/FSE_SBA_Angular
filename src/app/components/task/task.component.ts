import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog, MatDialogRef } from '@angular/material';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { TaskServiceService } from 'src/app/services/task-service.service';
import { ProjectServiceService } from 'src/app/services/project-service.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserData } from '../project/project.component';
import { DatePipe } from '@angular/common';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Task } from 'src/app/shared/model/task';
import { FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  @ViewChild(FormGroupDirective, {static: true}) myForm;
  taskId = this.route.snapshot.paramMap.get('id');
  constructor(private route:ActivatedRoute,private router: Router,private service : TaskServiceService,private projectService : ProjectServiceService,private userService : TaskManagerService,private notificationService : NotificationService,private dialog : MatDialog,private datePipe : DatePipe) { }
  userList: UserData[];
  projectList: UserData[];
  parentTaskList: UserData[];
  task :Task;

  ngOnInit() {    
    if(this.taskId){

      this.service.getTask(this.taskId).subscribe(data =>{

        this.task = data;
        this.service.populateForm(this.task);
      });      
    }
    this.loadProjects();
    this.loadParentTasks();
    this.loadUsers();
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
  loadParentTasks(){
    this.service.getParentTasks().subscribe(ptasks => {      

    let array:UserData[] = ptasks.map(ptask=>{
      return {
        userId: ptask.parentId,
        firstName: ptask.parentTaskName,
      };
    });
    this.parentTaskList = array;
    });
  }

  loadUsers(){
    this.userService.getUsers().subscribe(users => {      

    let array:UserData[] = users.map(user=>{
      return {
        userId: user.userId,
        firstName: user.firstName+' '+user.lastName,
      };
    });
    this.userList = array;
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
  searchProject(){
    const dialogRef = this.openDialog(this.projectList, 'Project');
    dialogRef.afterClosed().subscribe(project =>{
  
      this.service.form.controls['projectId'].setValue(project.userId);  
      this.service.form.controls['projectName'].setValue(project.firstName);    
    });    
  }
  searchParent(){
    const dialogRef = this.openDialog(this.parentTaskList,'Parent Task');
    dialogRef.afterClosed().subscribe(parentT =>{

        this.service.form.controls['parentId'].setValue(parentT.userId);  
        this.service.form.controls['parentTaskName'].setValue(parentT.firstName);    
    });    
  }
  searchUser(){
    const dialogRef = this.openDialog(this.userList,'User');
    dialogRef.afterClosed().subscribe(user =>{

        this.service.form.controls['userId'].setValue(user.userId);  
        this.service.form.controls['userName'].setValue(user.firstName);    
    });    
  }

  onSubmit(formdata) {    
    
    if (this.service.form.valid) {
      let userId : string = this.service.form.get('userId').value
      let parentId : string = this.service.form.get('parentId').value
      let projectId : string = this.service.form.get('projectId').value
      let chkPTask : string = this.service.form.get('chkPTask').value
      if(chkPTask){
        formdata = _.pick(formdata,['taskName','parentId']);
        let str = JSON.stringify(formdata);
        str = str.replace(/taskName/g,'parentTaskName');
       
        formdata = JSON.parse(str);
 
        this.service.addParentTask(formdata).subscribe(res=>{

          this.refreshPage();
          this.loadParentTasks();
          this.notificationService.success(':: Submitted successfully');
        });
      }else{      
        formdata = _.omit(formdata,['parentId','parentTaskName','projectId','projectName','userId','userName','chkPTask']);
        formdata = _.extend(formdata,{status : 'ACT'});    
        if (!this.service.form.get('taskId').value){
            this.service.addTask(formdata,parentId,projectId,userId).subscribe(res=>{

            this.refreshPage();
            this.notificationService.success(':: Submitted successfully');
          });
        }else{
            this.service.updateTask(formdata,parentId,projectId,userId).subscribe(res=>{
            this.refreshPage();
            this.notificationService.success(':: Updated successfully');
          });
        }
      }
    }
  }
  refreshPage(){
      this.service.form.reset();
      this.restFormErros();
      this.service.initilizeFormGroup();
  }
  enableParent(){

    if(this.service.form.get('chkPTask').value){
      this.service.form.get('projectName').disable();
      this.service.form.get('startDate').disable();
      this.service.form.get('endDate').disable();
      this.service.form.get('priority').disable();
      this.service.form.get('parentTaskName').disable();
      this.service.form.get('userName').disable();
    }else{
      let endDate = new Date();
      endDate.setDate(new Date().getDate()+1);
      this.service.form.get('projectName').enable();
      this.service.form.get('startDate').enable();
      this.service.form.get('endDate').enable();
      this.service.form.get('priority').enable();
      this.service.form.get('parentTaskName').enable();
      this.service.form.get('userName').enable();
      this.service.form.get('startDate').setValue(new Date());
      this.service.form.get('endDate').setValue(endDate);
    }
  }
  restFormErros(){
    if(this.myForm){
      this.myForm.resetForm();
    }
  }
}
