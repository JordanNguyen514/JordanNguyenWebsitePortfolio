$(function(){
    $('.your-class').slick({
        infinite: true,
        slidesToShow:3,
        slidesToScroll:1,
        arrows: true,
        autoPlay:false,
        autoPlaySpeed: 2000,
        dots: true,
        centerMode: true,
        centerPadding: '0',
    });
});



// City weather API

var cityButton = document.querySelector('.CitySubmit');
var cityVal = document.querySelector('.CityinputValue');
var weatherIn = document.querySelector('.weather');
var Temperature = document.querySelector('.temp');

cityButton.addEventListener("click", function(){
var JSONfileWeather = "http://api.openweathermap.org/data/2.5/weather?q=" + cityVal.value +
"&units=metric&APPID=fe75661e792e64f57f82a5bfc2eb3990"
$.getJSON(JSONfileWeather,
    function(data){
      console.log(data)

    var icon =
      "http://api.openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    var temp = Math.floor(data.main.temp);
    var weather = data.weather[0].main;

    $('.icon').attr('src', icon);
    weatherIn.innerHTML = weather;
    Temperature.innerHTML = "Temperature: " + temp + "°C";
});
})

// Covid-19 API
var countryCov = document.querySelector('.countryCovid');
var DateCov = document.querySelector('.DateCovid');
var CovButt = document.querySelector('.CovidSubmit');
var TotCovid = document.querySelector('.TotalCovid');
var CasesCovid = document.querySelector('.CaseCovid');

CovButt.addEventListener("click", function(){
fetch("https://covid-193.p.rapidapi.com/history?country=" + countryCov.value + "&day=" + DateCov.value, {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "d6867d1c6cmsh6ebfa6d2801af0cp1e6261jsn11a1bd39c437",
		"x-rapidapi-host": "covid-193.p.rapidapi.com"
	}
})
.then(response => response.json())
.then(response => {
	console.log(response);
  console.log(response.response[0]);

  var NumbCases = response.response[0].cases.new;
  var totcovid = response.response[0].cases.total;

  CasesCovid.innerHTML = "# for " + DateCov.value + ": " + NumbCases + " New Cases";
  TotCovid.innerHTML = "# as of " + DateCov.value + ": " + totcovid + " Total Cases";
})
.catch(err => {
	console.error(err);
});
})

var TickerStock = document.querySelector('.TickerStock');
var RegionStock = document.querySelector('.RegionStock');

var StockSubmit = document.querySelector('.StockSubmit');

var NameStock = document.querySelector('.NameStock');
var MarkCAP = document.querySelector('.MarkCAP');
var PriceToday = document.querySelector('.PriceToday');
var Change = document.querySelector('.Change');

StockSubmit.addEventListener("click", function(){
fetch("https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol="+ TickerStock.value
+"&region="+RegionStock.value, {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "d6867d1c6cmsh6ebfa6d2801af0cp1e6261jsn11a1bd39c437",
		"x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
	}
})
.then(response => response.json())
.then(response => {
	console.log(response);

  var LongNameStock = response.price.longName;
  var MktPrice = response.price.regularMarketPrice.fmt;
  var MktCap = response.price.marketCap.fmt;
  var PercChang = response.price.regularMarketChangePercent.fmt;
  var Curr = response.price.currency;

  NameStock.innerHTML = "Company name: " + LongNameStock
  MarkCAP.innerHTML = "Market Cap: " + MktCap + " " + Curr
  PriceToday.innerHTML = "Today's market price: " +MktPrice + " " + Curr
  Change.innerHTML = "Change: " + PercChang

})
.catch(err => {
	console.error(err);
});

})
