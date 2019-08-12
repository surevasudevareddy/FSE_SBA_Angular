import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectComponent} from './components/project/project.component';
import { UserComponent} from'./components/user/user.component';
import { TaskComponent} from'./components/task/task.component';
import { ViewTaskComponent } from './components/view-task/view-task.component';


const routes: Routes = [
  { path: '', redirectTo: 'addproject',
    pathMatch: 'full'
  },
  {path: 'adduser', component: UserComponent},
  {path: 'addproject', component: ProjectComponent},
  {path: 'addtask', component: TaskComponent},
  {path: 'editTask/:id', component: TaskComponent},
  {path: 'viewtask', component: ViewTaskComponent},
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
