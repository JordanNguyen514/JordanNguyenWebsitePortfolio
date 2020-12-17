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
var city = "Philadelphia"
var JSONfileWeather = "http://api.openweathermap.org/data/2.5/weather?q=" + city +
"&units=metric&APPID=fe75661e792e64f57f82a5bfc2eb3990"
$.getJSON(JSONfileWeather,
    function(data){
      console.log(data)

    var icon =
      "http://api.openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    var temp = Math.floor(data.main.temp);
    var weather = data.weather[0].main;
    $('.city').append(city);
    $('.icon').attr('src', icon);
    $('.temp').append(weather," ");
    $('.temp').append(temp,"°C");

});

// Covid-19 API
var countryCov = "usa"
var DateCov = "2020-12-17"

fetch("https://covid-193.p.rapidapi.com/history?country=" + countryCov + "&day=" + DateCov, {
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
  var dayofcase = response.response[0].day;
  var countrycovid = response.response[0].country;
  var totcovid = response.response[0].cases.total;
  $('.DateCovid').append(dayofcase);
  $('.countryCovid').append(countrycovid);
  $('.CaseCovid').append(NumbCases," Cases");
  $('.TotalCovid').append(totcovid," total cases");
})
.catch(err => {
	console.error(err);
});

var regionStock = "CA"
var symbolStock = "AC.TO"
fetch("https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol="+symbolStock
+"&region="+regionStock, {
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
  var TickerStock = response.price.symbol;
  var MktPrice = response.price.regularMarketPrice.fmt;
  var MktCap = response.price.marketCap.fmt;
  var Curr = response.price.currency;
  var PercChang = response.price.regularMarketChangePercent.fmt;

  $('.NameStock').append(LongNameStock);
  $('.tickerStock').append(TickerStock);
  $('.MarkCAP').append(MktCap," ", Curr);
  $('.PriceToday').append(MktPrice," ", Curr);
  $('.Change').append(PercChang);
})
.catch(err => {
	console.error(err);
});
