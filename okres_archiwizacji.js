document.getElementById('file-input').addEventListener('change', handleFileSelect, false);

function handleFileSelect(evt) {
  let file = evt.target.files[0];
  if (file) {
    getAsText(file);
  }     
}

function getAsText(readFile) {
  let reader = new FileReader();
  
  reader.readAsText(readFile);
  reader.onload = loaded;
}

function loaded(evt) {
  // Obtain the read file data
  let fileString = evt.target.result;
  let processed = processInput(fileString);
  printOut(processed);
}

function processInput(fileString) {
  let lines = fileString.split('\r\n');
  let processed = {};
  let lastDate = "";
  let items = [];
  
  // remove empty lines from the array
  // console.log(lines);
  lines = lines.filter(line => line != "");
  // console.log(lines);
  
  
  lines.forEach(line => {
    items = line.split(',');
    if (lastDate === "" || lastDate != items[1]) {
      lastDate = items[1];
      processed[items[1]] = [items[0]];
    } else {
      processed[items[1]].push(items[0]);
    }
  });
  
  // console.log(processed);
  return processed;
}

function setPrintValues() {
  // return object
  let result = {beforeBarcode: "", afterBarcode: "", scriptHead: "", scriptTail: ""};

  // get mode
  let mode = document.getElementById("modeSelect").value;
  if (mode == "archiwizacja") {
    result.beforeBarcode = "SELECT [This], [Barcode], [OkresArchiwizacji], [EmailNadawcy], [EmailOdbiorcy], [ZnakPisma], [SposobDostarczenia] FROM [Case_TOK_Kancelariaprzychodzaca] WHERE [Barcode] in (";
    result.scriptHead = "Public Sub OnCustomProcess (CEObject)<br>CEObject.OkresArchiwizacji = \""
    
  } else if (mode == "anulowanie") {
    result.beforeBarcode = "SELECT [This], [Bp8CaseID], [Barcode], [SSRN], [Status], [DateCreated] FROM [Case_TOK_Kancelariaprzychodzaca] WHERE [Barcode] in (";
    result.scriptHead = "Public Sub OnCustomProcess (CEObject)<br>CEObject.Status = \""
  }
  result.afterBarcode = ") OPTIONS(TIMELIMIT 180)";
  result.scriptTail = "\"<br>CEObject.Save<br>End Sub"

  return result;
}

function printOut(processed) {
  let printValues = setPrintValues();
  let divider = "~".repeat(80) + "";
  let resultDiv = document.getElementById("results");
  let index = 0;
  let parStr = "";
  let textContainer;
  
  
  for (let value in processed) {
    // print information and script
    let parent = addOutputDiv(index, resultDiv);

    parStr = "Value: " + value + "<br>";
    parStr += "Number of elements: " + processed[value].length + "<br><br>";
    parStr += "VB Script:";
    addParagraph(index, parStr, parent);

    parStr = printValues.scriptHead + value + printValues.scriptTail;
    textContainer = addParagraph(index, parStr, parent);
    addCopyButton(textContainer, parent, "Copy VB Script");

    parStr = "SQL querry:";
    addParagraph(index, parStr, parent);
    parStr = printValues.beforeBarcode;
    
    for (let i = 0; i < processed[value].length; i++) {
      const barcode = processed[value][i];
      parStr += "'" + barcode + "'";
      if (i != processed[value].length-1) {
        parStr += ",";
      }
      
    }
    parStr += printValues.afterBarcode;
    textContainer = addParagraph(index, parStr, parent);
    textContainer.id = "query" + index;
    addCopyButton(textContainer, parent, "Copy query");

    parStr = divider;    
    addParagraph(index, parStr, parent);

    index++;
    
  }
}

function addCopyButton(textContainer, parent, buttonText) {
  let button = document.createElement("button");
  button.onclick = function () {copyText(textContainer)};
  button.innerHTML = buttonText;
  parent.insertBefore(button, textContainer);
}

function copyText(textContainer) {
  var textarea = document.createElement('textarea')
  textarea.id = 'temp_element'
  // Optional step to make less noise on the page, if any!
  textarea.style.height = 0
  // Now append it to your page somewhere, I chose <body>
  document.body.appendChild(textarea)
  // Give our textarea a value of whatever inside the div of id=containerid
  textarea.value = textContainer.innerText
  // Now copy whatever inside the textarea to clipboard
  var selector = document.querySelector('#temp_element')
  selector.select()
  document.execCommand('copy')
  // Remove the textarea
  document.body.removeChild(textarea)
}

function addOutputDiv(index, parentDiv) {
  let elem = document.createElement("div");
  elem.id = "res" + index;
  parentDiv.appendChild(elem);
  return elem;
}
function addParagraph(index, parStr, parent){
  var para = document.createElement("p");
  para.innerHTML = parStr;
  parent.appendChild(para);
  return para;
}