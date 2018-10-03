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

function printOut(processed) {
  let beforeBarcode = "SELECT [This], [Barcode], [OkresArchiwizacji], [EmailNadawcy], [EmailOdbiorcy], [ZnakPisma], [SposobDostarczenia] FROM [Case_TOK_Kancelariaprzychodzaca] WHERE [Barcode] in (";
  let afterBarcode = ") OPTIONS(TIMELIMIT 180)";
  let divider = "~".repeat(80) + "";
  let resultDiv = document.getElementById("results");
  let index = 0;
  let parStr = "";
  let textContainer;
  
  
  for (let date in processed) {
    // print information and script
    let parent = addOutputDiv(index, resultDiv);

    parStr = "Date: " + date + "<br>";
    parStr += "Number of elements: " + processed[date].length + "<br><br>";
    parStr += "VB Script:";
    addParagraph(index, parStr, parent);

    parStr = "Public Sub OnCustomProcess (CEObject)<br>CEObject.OkresArchiwizacji = \""+ date + "\"<br>CEObject.Save<br>End Sub";
    textContainer = addParagraph(index, parStr, parent);
    addCopyButton(textContainer, parent, "Copy VB Script");

    parStr = "SQL querry:";
    addParagraph(index, parStr, parent);
    parStr = beforeBarcode;
    
    for (let i = 0; i < processed[date].length; i++) {
      const barcode = processed[date][i];
      parStr += "'" + barcode + "'";
      if (i != processed[date].length-1) {
        parStr += ",";
      }
      
    }
    parStr += afterBarcode;
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