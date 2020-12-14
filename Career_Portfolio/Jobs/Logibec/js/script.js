// JavaScript Document
 $(document).ready(function() {
    $('#autoWidth').lightSlider({
        autoWidth:true,
        loop:true,
        centerSlide:false,
        onSliderLoad: function() {
            $('#autoWidth').removeClass('cs-hidden');
        }
    });
  });
