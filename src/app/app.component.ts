import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  private djangoUrl = 'http://127.0.0.1:8000'; // Replace with your Django backend URL
  private testingdjangoUrl = 'http://127.0.0.1:8000/appname/alishba/'; // Replace with your Django backend URL
  chatData = [
    { query: "", response: "", time: "" },
    
    // Add more objects as needed
  ];


  constructor(private http: HttpClient) {}

  

  inputValue: string = '';

  sendQuery() {
    if (this.inputValue.trim() !== '') {
      const date = new Date(); // Replace this line with your date string
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      let query = this.inputValue;
      const formattedTime = date.getHours() + ':' + date.getMinutes() + ' ' + ampm;
      this.chatData.push({ query: this.inputValue, response: '', time: formattedTime });
  
      this.http.post(this.testingdjangoUrl, { query: this.inputValue }).pipe(
        tap(
          (response: any) => {
            // Handle the response from the backend here
            const index = this.chatData.findIndex(item => item.query === query);
            if (index !== -1) {
              this.chatData[index].response = this.formatResponse(response.response);
              query = '';
            }
            console.log('Response from backend:', response);
          },
          (error: any) => {
            console.error('Error in sending the query to the backend', error);
          }
        )
      ).subscribe();
      this.inputValue = ''; // Clear the input value after sending the query
    }
  }
  
  formatResponse(response: string): string {
    const stepsRegex = /\d+\.\s/g;
    const stepsReplaced = response.replace(stepsRegex, (match) => {
      return '\n' + match;
    });
    return stepsReplaced;
  }
  
  refreshQuery() {
    if (this.chatData.length > 0) {
      const lastQuery = this.chatData[this.chatData.length - 1].query;
      this.http.post(this.testingdjangoUrl, { query: lastQuery }).pipe(
        tap(
          (response: any) => {
            // Handle the response from the backend here
            const index = this.chatData.findIndex(item => item.query ===lastQuery );
            if (index !== -1) {
              this.chatData[index].response = response.response;
              
            }
            console.log('Response from backend:', response);
          },
          (error: any) => {
            console.error('Error in sending the query to the backend', error);
          }
        )
      ).subscribe();
    } else {
      console.log('No queries available to refresh');
    }
  }

}

