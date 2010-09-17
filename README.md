LazyLoad
========

LazyLoad is a tiny (only 818 bytes minified and gzipped), dependence-free
JavaScript library that makes easy to load external JavaScript and CSS
files on demand. It's ideal for quickly and unobtrusively loading large
external scripts and stylesheets either lazily after the rest of the page
has finished loading or a demand as needed.

In addition to CSS support, this version of LazyLoad also adds support for
parallel loading of multiple resources in browsers that support it. To load
multiple resources in parallel, simply pass an array of URLs in a single
LazyLoad call.


Usage
-----
Using LazyLoad is simple. Just call the appropriate method -- 'css()' to load
CSS , 'js()' to load JavaScript -- and pass in a URL or array of URLs to load.
You can also provide a callback function if you'd like to be notified when the 
resources have finished loading, as well as an argument to pass to the callback
and a context in which to execute the callback.

           // load a single JavaScript file and execute a callback when it finishes.
           LazyLoad.js('foo.js', function(){
               alert('foo.js has been loaded!');
           });

           // load multiple JS files and execute a callback when they've all finished.
           LazyLoad.js(['foo.js','bar.js','buzz.js','ninja.js'], function(){
               alert('All files have been loaded!'); 
           });

           // load a CSS file and pass an argument to the callback function.
           LazyLoad.css('foo.css',function(arg){
               alert(arg);
           },'foo.css has been loaded');

          //load a CSS file and execute the callback in a different scope.
          LazyLoad.css('foo.css',function(){
             alert(this.resp);//display 'foo.css has been loaded
          },null,{resp: 'foo.css has been loaded!'});


Supported Browsers
------------------

* Firefox 2+
* Google Chrome (all versions)
* Internet Explorer 6+
* Opera 9+
* Safari 3+
* Mobile Safari (all versions)