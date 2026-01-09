// --- Global Time Function (used on body onload) ---

function checkTime(i) {
  if (i < 10) { // add zero in front of numbers < 10
    i = "0" + i;
  }
  return i;
}

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  // Check if the 'time' element exists before trying to update it
  if (document.getElementById('time')) {
    document.getElementById('time').innerHTML = "Time: " + h + ":" + m + ":" + s;
  }
  var t = setTimeout(startTime, 500);
}

startTime();

function myFunction() {
  var x = document.getElementById("mytopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

/**
 * Toggles the visibility of extra text and updates the button label.
 * @param {string} dotsId - The ID of the span element containing the '...'
 * @param {string} moreId - The ID of the span element containing the extra text
 * @param {string} btnId - The ID of the button element
 * @param {string} lang - The language ('en' for English, 'fr' for French)
 */
function toggleReadMore(dotsId, moreId, btnId, lang) {
  var dots = document.getElementById(dotsId);
  var moreText = document.getElementById(moreId);
  var btnText = document.getElementById(btnId);

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    if (lang === 'en') {
      btnText.innerHTML = "Read More";
    } else if (lang === 'fr') {
      btnText.innerHTML = "Lire Plus";
    }
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    if (lang === 'en') {
      btnText.innerHTML = "Read Less";
    } else if (lang === 'fr') {
      btnText.innerHTML = "Lire Moins";
    }
    moreText.style.display = "inline";
  }
}

// Function to fetch and update the visitor count
function updateVisitorCounter() {
    // !! IMPORTANT: REPLACE THIS URL with your actual API Gateway Invoke URL from Step 6 !!
    const apiGatewayUrl = 'https://mwtufj8xia.execute-api.ca-central-1.amazonaws.com/prod'; 

    fetch(apiGatewayUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.visits !== undefined) {
                // Update the text content of the #visitorCounter element
                document.getElementById('visitorCounter').textContent = `Visitors: ${data.visits}`;
            }
        })
        .catch(error => {
            console.error('Error fetching visitor count:', error);
            document.getElementById('visitorCounter').textContent = 'Visitors: N/A';
        });
}
updateVisitorCounter();
