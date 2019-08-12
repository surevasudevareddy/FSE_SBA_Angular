import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, ValidatorFn, ValidationErrors, FormGroupDirective, NgForm } from '@angular/forms';
import { AppCustomValidator } from '../validators/app-custom-validator';
import { Observable, of } from 'rxjs';
import { Project } from '../shared/model/project';
import { tap, retry, catchError } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ErrorStateMatcher } from '@angular/material';

export /** Error when the parent is invalid */
class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    //return control.dirty && form.invalid;
    return control.touched && form.hasError('invalidDates');
  }
}

const url = 'http://localhost:8088/taskManagerService/';
const httpOptions = {
  headers : new HttpHeaders({'Content-Type': 'application/json'}),
  responseType: 'text' as 'json' 
};

@Injectable({
  providedIn: 'root'
})
export class ProjectServiceService {
  
  form : FormGroup;
  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private fb:FormBuilder,private http: HttpClient) {    
    this.form = this.fb.group({
      projectId: new FormControl(null),
      projectName: new FormControl('',AppCustomValidator.required),
      startDate: new FormControl({value : '', disabled: true},AppCustomValidator.fromDateValidator),
      endDate: new FormControl({value : '', disabled: true},AppCustomValidator.toDateValidator),
      priority: new FormControl(0),
      userId: new FormControl(null),
      userName: new FormControl(null,AppCustomValidator.required),
      checkDates: new FormControl(false)
      },{validator: AppCustomValidator.identityRevealedValidator});
  } 
  //{validator: AppCustomValidator.compose([
  //  AppCustomValidator.dateLessThan('startDate', 'endDate', { 'invalidDates': true }),
  
  ngOnInit(){
    
  }
  initilizeFormGroup(){
    this.form.reset();
    this.form.setValue({
      projectId:0,
      userId: 0,
      userName: '',
      projectName: '',
      startDate: '',
      endDate: '',
      priority:0,
      checkDates:false,
    })
    this.form.controls['startDate'].disable();
    this.form.controls['endDate'].disable();
  }
  populateForm(project) {

    if(project.startDate && project.endDate){
      this.form.controls['startDate'].enable();
      this.form.controls['endDate'].enable();   
    }
    this.form.setValue({
      projectId:project.projectId,
      userId: project.user.userId,
      userName: project.user.firstName +' '+project.user.lastName,
      projectName: project.projectName,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      priority:project.priority,
      checkDates:(project.startDate && project.endDate)?true:false,
    });    
  }
  addProject(project,userId):Observable<Project>{
    console.log("adding New Project:"+JSON.stringify(project));
    return this.http.post<Project>(url+'createProject?userId='+userId, JSON.stringify(project),httpOptions).pipe(
      tap(res=>{console.log('Add Response'+res)}),
      retry(1),
      catchError(this.handleError<Project>('Add Project'))
    )
  }

  updateProject(project :Project,userId): Observable<Project>{
    return this.http.put<Project>(url+'updateProject?userId='+userId,project,httpOptions).pipe(
      tap((user)=> {console.log(`updated Project W/ id=${project.projectId}`)}),
      catchError(this.handleError<any>('update Project'))
    )
  }
    getProjects(): Observable<Project[]>{
      console.log("service calling getProjects")
      return this.http.get<Project[]>(url+'getProjects').pipe(
        tap(_ => console.log("searched Project results")),
        catchError(this.handleError<Project[]>('search Project',[]))
      )
    }

    deleteProject(id):Observable<Project>{
      return this.http.delete(url+'deleteProject/'+id).pipe(
        retry(1),
        catchError(this.handleError<any>('Delete Project'))
      )
    }
    public hasError = (controlName: string, errorName: string) =>{
      return this.form.controls[controlName].hasError(errorName);
    }
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  } 
}
