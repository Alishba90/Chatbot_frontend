import { Component  ,Renderer2,ElementRef,ViewChild, AfterViewChecked} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements AfterViewChecked {

  showInitialMsg: boolean = true;//initial msg display before any conversation initiation

  @ViewChild('scrollDiv', { static: true }) private myScrollContainer: ElementRef;//scrollable chat window

  isButtonDisabled: boolean = false;

  private djangoUrl = 'http://127.0.0.1:8000'; // Replace with your Django backend URL
  private testingdjangoUrl = 'http://127.0.0.1:8000/appname/chat/'; // Replace with your Django backend URL
  chatData = [
    { query: "", response: "", time: "" },
    
    // Add more objects as needed
  ];

  toggleButton() {
    this.isButtonDisabled = !this.isButtonDisabled;
  }

  ngAfterViewInit() {
    this.setScrollbarVisibility();
  }
  constructor(private http: HttpClient,private renderer: Renderer2,private elRef: ElementRef) {
    this.myScrollContainer = new ElementRef(null);
  }

  

  inputValue: string = '';


  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      this.renderer.setStyle(this.elRef.nativeElement.querySelector('#chatContainer'), 'overflow-y', 'scroll');
    } catch(err) { }
  }


  sendQuery() {
    if (this.inputValue.trim() !== '') {
      if(this.showInitialMsg){
        this.showInitialMsg=false
      }

      //add the current time to the user query
    const date = new Date(); 
    const hours = date.getHours() % 12 || 12; // Convert 24-hour time to 12-hour time
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const formattedTime = hours + ':' + minutes + ' ' + ampm;

    //push the values to the chat window
    let query = this.inputValue;
    this.chatData.push({ query: this.inputValue, response: '', time: formattedTime });
    this.toggleButton()  
    //scroll the chat window to the most recent query
    this.scrollToBottom();

    //send the query to the backend
  
      this.http.post(this.testingdjangoUrl, { query: this.inputValue }).pipe(
        tap(
          (response: any) => {
            // Handle the response from the backend here
            const index = this.chatData.findIndex(item => item.query === query);

            //scroll the chat window to the most recent response
            this.scrollToBottom();
            
            //update response in the chat window
            if (index !== -1) {
              this.chatData[index].response = this.formatResponse(response.response);
              query = '';
              this.toggleButton()
            
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

    //format the response to preserve the original format
    const stepsRegex = /\d+\.\s/g;
    const stepsReplaced = response.replace(stepsRegex, (match) => {
      return '\n' + match;
    });
    return stepsReplaced;
  }

//hide the scrollbar when there are no chats or else display  
  setScrollbarVisibility() {

    const targetDiv = this.elRef.nativeElement.querySelector('#chatContainer'); // Replace 'your-div-id' with your div's ID
    if (this.showInitialMsg) {
      this.renderer.setStyle(targetDiv, 'overflow', 'hidden');
    } else {
      this.renderer.removeStyle(targetDiv, 'overflow');
      this.renderer.setStyle(targetDiv, 'overflow', 'scroll');
    }
  }
  
  refreshQuery() {
    if (this.chatData.length > 0) {
      const lastQuery = this.chatData[this.chatData.length - 1].query;
      this.chatData[this.chatData.length - 1].response='';
      this.toggleButton()
      //scroll the chat window to the most recent query
      this.scrollToBottom();

      this.http.post(this.testingdjangoUrl, { query: lastQuery }).pipe(
        tap(
          (response: any) => {
            // Handle the response from the backend here
            const index = this.chatData.findIndex(item => item.query ===lastQuery );

            //scroll the chat window to the most recent response
            this.scrollToBottom();

            if (index !== -1) {
              this.chatData[index].response = response.response;
              this.toggleButton()
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