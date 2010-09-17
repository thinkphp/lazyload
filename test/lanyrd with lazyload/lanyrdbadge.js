/*
 * Lanyrd is a cool new web site to organise the events you go 
 * to and speak at. This script is a badge to show off your upcoming events
 * on your own web site. In YQL you can get any HTML of a page and scrape it.
 * You then can get it back as XML and if you provide a callback method name
 * it return it as JSON-P which is HTML as a string inside a JSON callback.
 * The first thing you need to do is to find the HTML you want. What I want is
 * the DIV that contains the H2 Element with the word 'Future' in it.
 * Incredible,flexible and elegant XPath syntax is //H2[contais(.,'Future')]/..]
 * or "get all the H2 Elements where the text node contains the word 'Future' and
 * then go up one level in the DOM hierarchy".
 */
var lanyrdbadge = function(){
    var l;
    function init(){

         //get element with ID 'lanyrd'
         l = document.getElementById('lanyrd');

         /*
           You test if there is an element with ID 'lanyrd' and
           if it is a link. If it is, you add a loading message to its text
           and read its URL href. You then assemble the URL of the YQL command and 
           create a new SCRIPT element pointing to it. Once this has been executed it will
           call the method lanyrdbadge.seed(). All the seed message needs to do is to replace the class
           of the DIV with the ID of 'lanyrd' and remove the 'speaking at' message. This then allows you to 
           write some CSS to style the badge.
            -if JavaScript is not supported all you have in your document is a link to your profile on Lanyrd.
            -if the JavaScript is supported you can style the badge any way you want.
         */
          
         if(l && l.nodeName.toLowerCase() == 'a') {

              l.innerHTML += '<span>(Loading&hellip)</span>';  
              var user = l.getAttribute('href');

              var endpoint = "http://query.yahooapis.com/v1/public/yql?q=";

              var yql = 'select * from html where url="'+user+'" and xpath="//h2[contains(.,\'Future\')]/.."';  

              var url = endpoint + encodeURIComponent(yql) + '&diagnostics=true&format=xml&callback=lanyrdbadge.seed';                        

              LazyLoad.js(url,function(){if(window.console)console.log(this.response);},null,{response: 'Loaded JS'});

              LazyLoad.css('lanyrdbadge.css',function(arg){if(window.console)console.log(arg);},'Loaded CSS');
                
         }

    }

    function seed(o) {
            if(window.console) {console.log(o);}
             var res = o.results[0];
             res = res.replace(/class="split"/,'id="lanyrd"');  
             res = res.replace(/speaking at/,'');
             res = res.replace(/href="/gi,'href="http://lanyrd.com');
             res = res.replace(/src="/gi,'src="http://lanyrd.com');
             var newDiv = document.createElement('div');
                 newDiv.innerHTML = res;
             l.parentNode.appendChild(newDiv);
             l.parentNode.removeChild(l); 
    } 

   return {init: init, seed: seed};
}();
lanyrdbadge.init();