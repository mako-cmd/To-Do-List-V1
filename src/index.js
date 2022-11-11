import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { renderToStaticMarkup } from "react-dom/server"
import './index.css';
import { useEffect } from 'react';



class ToDoList extends React.Component 
{
  constructor(props)
  {
    //Set up stateful variables
    super(props);                 //This just has to be done something to do with inheritance
    this.state ={
      SearchBarMode:  "Search",   //Select between Search and New (new item)
      SearchBarState: "true",     //True: Search bar is visible, false: Search bar is invisible
      SearchBarFunction: "Search",//Seems to be functional plagarism of SearchBarMode but for different       
                                  //portions of code. I really dont want to touch it. Might break my code 
      TotalListItems: "0",        //Monitors total items in the to do list
      ListData: "",               //AKA data: String that holds item descriptions as a string with seperator '|'
                                  //How its packaged: |desciption[0]||desciption[1]||desciption[n]| 
      ListItemState: [],          //IDs whether tickbox on list item has been toggled Either Pending or Complete
      ListViewState: "All",       //Modifies items in list based on their ListItemState. Controlled by toolbar 
                                  //buttons
      isSearching: false,         //Used to inform RenderList() that a search query has been lodged
      query: " ",                 //The query string that has been lodged  
    }

    //Binding state to class methods
    this.BtnHandler = this.BtnHandler.bind(this);
    this.UpdateBar = this.UpdateBar.bind(this);
    this.SearchBarHandler = this.SearchBarHandler.bind(this);
    this.RenderList = this.RenderList.bind(this);
    this.Clicked = this.Clicked.bind(this);
    this.Console = this.Console.bind(this);
  }
  

  SearchBarHandler(e)
  {
    //Event on HTML element is when keyboard is pressed
    //Filter to ID if key pressed is 'Enter'
    if(e.key === "Enter")
    {
      //If new button on toolbar was toggled
      if(e.target.placeholder === "New")
      {
        //Update mode: for Renderlist()
        this.setState({SearchBarMode: "New"})
        //Increase list item count by 1
        this.setState({TotalListItems: Number(this.state.TotalListItems) + 1});        
        this.setState({ListData:  this.state.ListData + "|" + e.target.value + "|"});

        //clear search bar field
        document.getElementById(e.target.id).value = "";
      }
      if(e.target.placeholder === "Search")
      {
        //Change search bar mode of operation
        this.setState({SearchBarMode: "Search"});
        //Inform renderlist a search has been perfomed by changing isSearching state variable
        this.setState({isSearching: true});
        //Save query value
        this.setState({query: e.target.value});

        //clear search bar field
        document.getElementById(e.target.id).value = "";
      }
    }
  }

  //Handles any button presses by user: Summoned by toolbar handler component & ListItem-Checkboxes
  BtnHandler(e)
  {
    let counter = 0;
    let indexStart = null;
    let indexEnd = null;
    let data = this.state.ListData;
    let frontPiece = null;
    let endPiece = null;
    let afterDeletion = "";
    let NumberOfExtractedItems = 0;
    let ListItemStateBuffer = this.state.ListItemState;
    //If any key is pressed end search session. session?
    //Assume any previous search functin is done and clear search request
    this.setState({isSearching: false});
    //
    var pressedButton = e.target.id;
    //alert(pressedButton);
    if(pressedButton === "Search")
    {
      //Make bar disappear only if function mode is search 
      if(this.state.SearchBarState === "true" && this.state.SearchBarFunction === "Search")
      {
        //Make Bar disappear
        this.setState({SearchBarState: "false"},this.UpdateBar);
      }
      else
      {
        //Make bar appear 
        this.setState({SearchBarState: "true"},this.UpdateBar);
        //Set function of bar to search
        this.setState({SearchBarFunction: "Search"});
      }
    }
    else if(pressedButton === "New")
    {
      //Make bar disappear only if function mode is new 
      if(this.state.SearchBarState === "true" && this.state.SearchBarFunction === "New")
      {
        //Make Bar disappear
        this.setState({SearchBarState: "false"},this.UpdateBar);
      }
      else
      {
        //Make bar appear 
        this.setState({SearchBarState: "true"},this.UpdateBar);
        //Set function of bar to search
        this.setState({SearchBarFunction: "New"});
      }
    }
    //Dont filter
    else if(pressedButton === "All")
    {
      //ListViewState is used by RenderList durring rendering
      this.setState({ListViewState: "All"});
    }
    //Show pending items only
    else if(pressedButton === "Pending")
    {
      //ListViewState is used by RenderList durring rendering
      this.setState({ListViewState: "Pending"});
    }
    //Show Complete items only ie crossed out
    else if(pressedButton === "Complete")
    {
      //ListViewState is used by RenderList durring rendering
      this.setState({ListViewState: "Complete"});
    }
    //Delete particular 
    else if(pressedButton === "Delete")
    {
      //Are you sure you want to delete prompt
      if(window.confirm("Are you sure you want to delete list item " + e.target.name + "?\nYou can also mark it as complete instead."))
      {
        //Extraction machine: Extract list item description from this.state.data
        counter = 0;
        while(counter < data.length)
        {
          if(data[counter] === "|")
          {
            if(indexStart === null)
            {
              indexStart = counter + 1;
            }
            else if(indexStart != null)
            {
              indexEnd = counter;
            }
            counter++;
          }
          else
          {
            counter++;
          }
          //If both ends of valid item have been found: pseudo-extract
          if(indexStart != null && indexEnd != null)
          {
            //We are using the item's delete buttons name which corresponds to its position not index in the data array here, so we are checking if we have found the right one here.
            //PS: We move to the next position at the end of this if stat so that position is checked on the next loop iteration
            if(NumberOfExtractedItems === Number(e.target.name))
            {
              frontPiece = data.slice(0,(indexStart - 1));      //Extract data before position to be axed
              endPiece = data.slice(indexEnd + 1, data.length); //Extract data after position to be axed
              afterDeletion = frontPiece + endPiece;            //Reconstruct state.data with position to be axed
                                                                //removed

              //Update List Item State ie Ticks and cross through state object (its an of all list items array)
              ListItemStateBuffer.splice(e.target.name);
              this.setState({ListData: afterDeletion});         //Save new string
              this.setState({TotalListItems: this.state.TotalListItems - 1}); //Update TotalListItems item has
                                                                              //been removed
              break;  //Exit loop deletion is complete
            }
            
            NumberOfExtractedItems++; //Move to next position (not index) if data
            //Reset extraction machine
            indexStart = null;        
            indexEnd = null;
          }
        }
        //Exited loop with no errors: Item has been deleted
        alert("Item " + e.target.name + " is deleted!");
      }
    }
  }

  //Update bar based on state variables
  UpdateBar()
  {
    //Show bar as search
    if(this.state.SearchBarState === "true")
    {
      document.getElementById("SearchBar").style.visibility = "visible";
      document.getElementById("SearchBar").placeholder = this.state.SearchBarFunction;
    }
    //Show bar as new item
    else
    {
      document.getElementById("SearchBar").style.visibility = "hidden";
      document.getElementById("SearchBar").placeholder = this.state.SearchBarFunction;
    }
  }

//Console in toolbar: Shows items in list for now
  Console()
  {
    return(
      <p className='InfoConsole' id="InfoConsole">Total Items: {this.state.TotalListItems }</p>
    );
  }

//Search Bar Object
SearchBar()
{
  return(
    <div className='Search-Bar'>
      <input  type="email" class="form-control" 
              id="SearchBar" aria-describedby="emailHelp" 
              placeholder="Search" onKeyDown={this.SearchBarHandler}/>
    </div>
  );
}

//List Item Object
ListItem(data, ItemNumber, isPending)
{
  return(
    <div className="ListItem-Body" name={"ListBody-" + ItemNumber} id="Pending">    
      <div className='ListItem-Tick'>
        <input className='form-check-input' name={"ListCheckBox-" + ItemNumber} type="checkbox" 
        checked={!isPending} 
        onClick={this.Clicked}/>
      </div>
      
      <div className='divider'></div>
      
      <div 
        className={isPending ? "ListItem-Description" : "ListItem-Description CrossedOut"}
        name={"ListDescription-" + ItemNumber}>
      
        {data} 
      </div>
      <div>
        <button id="Delete" name={ItemNumber} type="button" class="ToolBar-Item cil-trash btn btn-default" style={{color: "grey"}} aria-label="Left Align" onClick={this.BtnHandler}>
          <span class="glyphicon glyphicon-align-left" aria-hidden="true" ></span>
        </button>
      </div>
        
    </div>
  );
}

//If tick on list item is toggled: Marks it as complete/pending
Clicked(e)
{
  //get object name of calling listitem
  //List item position in state.data is encoded in the name
  let CallingOjectName = e.target.name;               
  let CallingOjectIndex = CallingOjectName[(CallingOjectName.length - 1)] //Extract list item position
  let ListItemStateBuffer = this.state.ListItemState;   //Get dummy of ListItems' states
  
  //alert(CallingOjectIndex); //debugging

  //Toggle states
  if(this.state.ListItemState[CallingOjectIndex] === "Pending")
  {
    ListItemStateBuffer[CallingOjectIndex] =  "Complete";
  }
  else if(this.state.ListItemState[CallingOjectIndex] === "Complete")
  {
    ListItemStateBuffer[CallingOjectIndex] =  "Pending";
  }
  //Update state.ListItemState
  this.setState({ListItemState: ListItemStateBuffer});

}

//Bottom ToolBar object
ToolBar()
{
  return(
  <div className="ToolBar-Body">
    <div className='ToolBar-Item'>
      <button id="Search" type="button" class="ToolBar-Item cil-search btn btn-default" aria-label="Left Align" onClick={this.BtnHandler}>
        <span class="glyphicon glyphicon-align-left" aria-hidden="true"></span>
      </button>
      </div>
        <div className='ToolBar-Item'>
          <button id="New" type="button" class="ToolBar-Item cil-plus btn btn-default" aria-label="Left Align" onClick={this.BtnHandler}>
            <span class="glyphicon glyphicon-align-left" aria-hidden="true"></span>
          </button>
        </div>

        <div className='divider' style={{borderColor: "white"}}></div>
        <div className='Console'>
          {this.Console()}
        </div>
        <div className='divider' style={{borderColor: "white"}}></div>
        
        <div className='ToolBarFilter-Complete'>
          <button id="All" type="button" class="ToolBarFilter-Complete btn btn-default" aria-label="Left Align" onClick={this.BtnHandler}>
            All
          </button>
        </div>
        <div className='ToolBarFilter-Complete'>
          <button id="Pending" type="button" class="ToolBarFilter-Complete btn btn-default" aria-label="Left Align" onClick={this.BtnHandler}>
            Pending
          </button>
        </div>
        <div className='ToolBarFilter-Complete'>
          <button id="Complete" type="button" class="ToolBarFilter-Complete btn btn-default" aria-label="Left Align" onClick={this.BtnHandler}>
            Complete
          </button>
        </div>
      </div>
  );
}

//RenderList: Very messy does a lot including:Render list items as per state.data
// -                                          Filter list items before rendering
// -                                          Facilitates both searchbar and toolbar filters
RenderList(totalItems, data)
{
  let counterRepackage = 0; //Total items that have been extracted from state.ListItems
  let counter = 0;
  let bulkElement = Array(totalItems).fill("");
  let ListItemStateBuffer = this.state.ListItemState;
  let indexStart = null;
  let indexEnd = null;
  let isPending = true;
  //var plainHTML = " ";

  //Update ListItemState object by adding all NEW (NEW ONLY!) ListItems as pending
  if(this.state.ListItemState.length < totalItems)
  {
    //start counting from new item sonly
    counter = this.state.ListItemState.length;
    while(counter < totalItems)
    {
      ListItemStateBuffer[counter] = "Pending";
      counter++;
    }
    //Update state.ListItemState accordingly
    this.setState({ListItemState: ListItemStateBuffer});
  }  
  //Extraction machine just like in btnHandler() but way bigger and messier
  counter = 0;
  while (counter < data.length)
  {
    //Extraction machine: ID valid data: see ListItemData
    if(data[counter] === "|")
    {
      if(indexStart === null)
      {
        indexStart = counter + 1;
      }
      else if(indexStart != null)
      {
        indexEnd = counter;
      }
      counter++;
    }
    else
    {
      counter++;
    }

    if(indexStart != null && indexEnd != null)
    {
      //Mechanism to inform ListItem method of ListItem's state
      //It uses this to either cross it out or display it as normal as per tick
      if(this.state.ListItemState[counterRepackage] === "Pending")
      {
        isPending = true;
      }
      else if(this.state.ListItemState[counterRepackage] === "Complete")
      {
        isPending = false;
      }
      //View filter: DO not filter
      if(this.state.ListViewState === "All")
      {
        //Check if a search query has been lodged
        if(this.state.isSearching)
        {
          //If current extraction matches search query
          if(data.slice(Number(indexStart),Number(indexEnd)).toLowerCase() === this.state.query.toLowerCase())
          {
            //Pack for rendering
            bulkElement[counterRepackage] = this.ListItem(data.slice(Number(indexStart),Number(indexEnd),), 
            counterRepackage,isPending);
          }
        }
        //If not searching pack everything for rendering
        else
        {
          bulkElement[counterRepackage] = this.ListItem(data.slice(Number(indexStart),Number(indexEnd),), 
          counterRepackage,isPending);
        }
        //move to next extraction/position
        counterRepackage++;
        //Reset extraction machine
        indexStart = null;
        indexEnd = null;
      }
      //View filter: Show pending items only SEE view filter ALL
      else if(this.state.ListViewState === "Pending")
      {
        if(isPending)
        {
          if(this.state.isSearching)
          {
            if(data.slice(Number(indexStart),Number(indexEnd)).toLowerCase() === this.state.query.toLowerCase())
            {
              bulkElement[counterRepackage] = this.ListItem(data.slice(Number(indexStart),Number(indexEnd),), 
            counterRepackage,isPending);
            }
          }
          else
          {
            bulkElement[counterRepackage] = this.ListItem(data.slice(Number(indexStart),Number(indexEnd),), 
            counterRepackage,isPending);
          }
          counterRepackage++;
          indexStart = null;
          indexEnd = null;
        }
        else
        {
          counterRepackage++;
          indexStart = null;
          indexEnd = null;
        }
      }
      //View filter: Show complete items only SEE view filter ALL
      else if(this.state.ListViewState === "Complete")
      {
        if(!isPending)
        {
          if(this.state.isSearching)
          {
            if(data.slice(Number(indexStart),Number(indexEnd)).toLowerCase() === this.state.query.toLowerCase())
            {
              bulkElement[counterRepackage] = this.ListItem(data.slice(Number(indexStart),Number(indexEnd),), 
            counterRepackage,isPending);
            }
          }
          else
          {
            bulkElement[counterRepackage] = this.ListItem(data.slice(Number(indexStart),Number(indexEnd),), 
            counterRepackage,isPending);
          }

          counterRepackage++;
          indexStart = null;
          indexEnd = null;
        }
        else
        {
          counterRepackage++;
          indexStart = null;
          indexEnd = null;
        }
      }
    } 
  }
  if(counterRepackage > 0)
  {
    //clear id=list element: There is only 1
    //document.getElementById("List").innerHTML = " ";
    //Convert JSX element array to plain HTML
    //plainHTML = plainHTML + " " + renderToStaticMarkup(bulkElement);
    //Push HTML to div of id list: There is only 1 its the same one
    //document.getElementById("List").innerHTML = plainHTML;
    //Delete all items
    //this.setState({TotalListItems: "0",ListData: "|"})

    //You could do what is above and not have events attached to your html
    //Or you could return your JSX element array to render()
    //Inform renderlist a search has been perfomed by changing isSearching state variable

    //Return packed JSX element array
    return(bulkElement);
    
  }
  
}

//Show entire To do list Object
  render()
  {
    return(
      <div className="container-fluid full-page">
          <div ></div> <div ></div> <div ></div> <div ></div>
          <div >
            <div className="Container-fluid App-Body">
              <div className="Title-Section">
                <div></div>
                <b>TO DO LIST</b>
              </div>
              <div className="Search">
                {this.SearchBar()}
              </div>
              <div className='List' id="List">
                {this.RenderList(Number(this.state.TotalListItems), this.state.ListData)}
              </div>
              <div className='Container-fluid Tool-Bar'>
                {this.ToolBar()}
              </div>  
            </div>
            <div>
            </div>
          </div>
        </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ToDoList />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
