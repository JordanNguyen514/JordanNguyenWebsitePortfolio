const imgBx = document.querySelectorAll('.imgBx');
imgBx.forEach(popup => popup.addEventListener('click',() =>{
  popup.classList.toggle('active')
}))

function delay1 (URL) {
    setTimeout( function() { window.location =
      "https://www.youtube.com/watch?v=Pa-c4rlHuUo&t=844s&ab_channel=proTennisPhotos"
     }, 5000 );
}

function delay2 (URL) {
    setTimeout( function() { window.location =
      "https://www.youtube.com/watch?v=N5SfxucKGsE&ab_channel=Pain%26Gain"
     }, 5000 );
}

function delay3 (URL) {
    setTimeout( function() { window.location =
      "https://www.youtube.com/watch?v=pF9-SWrN_QM&ab_channel=MLB"
     }, 5000 );
}

function delay4 (URL) {
    setTimeout( function() { window.location =
      "https://www.youtube.com/watch?v=fiRZ3enxCsM&ab_channel=WallyKozak"
     }, 5000 );
}
