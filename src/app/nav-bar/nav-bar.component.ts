import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  navLinks: any[];
  activeLink = './addproject';
  constructor(private router: Router) { 
    this.navLinks = [
      {
        label: 'Add Project',
        link: './addproject',
        index: 0
    },
    {
      label: 'Add Task',
      link: './addtask',
      index: 1
    },
    {
      label: 'Add User',
      link: './adduser',
      index: 2
    },
    {
      label: 'View Task',
      link: './viewtask',
      index: 3
  }];
  }
  ngOnInit() {
   
  }

}
