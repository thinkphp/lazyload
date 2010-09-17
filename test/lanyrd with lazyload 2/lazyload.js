/* @description
 * LazyLoad - makes it easy and painless to lazily load one
 * or more external JavaScript or CSS files on demand
 * either during or after the rendering of a web page.
 * Supported browsers include: Firefox 2+, IE6+, Safari 3+ 
 * (include Mobile Safari), Google Chrome and Opera 9+. Other
 * browsers may or may not work and are not officially supported.
 *
 * @module LazyLoad
 * @class LazyLoad
 * @static
 * @version 2.0.0.dev (git)
 */

var LazyLoad = (function(){

    /* --- private variables --- */

    //reference to the browser's document object.
    var d = document, 

    //reference to the <head> Element
    head,

    //requests currently in progress. if any
    pending = {},

    //queued requests.
    queue = {css: [], js: []},   

    //user agent information
    ua;

    /* --- private methods  --- */  


    /**
      * Creates and returns an HTML Element with the specified name and attributes.
      *
      * @method createNode
      * @param (String) name - element name
      * @param (Object) attrs - name/value mapping of element attributes 
      * @return (HTMLElement) 
      * @private
      */
    function createNode(name,attrs) {

        var node = d.createElement(name),
            attr;
            for(attr in attrs) {
                if(attrs.hasOwnProperty(attr)) {
                    node.setAttribute(attr,attrs[attr]);  
                } 
            } 
       return node; 
    }

    /**
      * Called when the current pending resource of the specified type 
      * has finished loading. Executes the associated callback (if any)
      * and loads the next resource in the queue.
      *
      * @method finish
      * @param type (String) - resource typ ('css' or 'js')
      * @private 
      */
    function finish(type) {

       var p = pending[type];

       if(!p) {return;}

       var callback = p.callback,
           urls     = p.urls;

           urls.shift();
 
           if(!urls.length) {

               if(callback) {
                  callback.call(p.scope || window, p.obj); 
               } 

               pending[type] = null;
 
               if(queue[type].length) {
                  load(type); 
               }
           }
                   
    }//end function 


    /**
      * Populates the 'ua' variable with useragent information using 'navigator.userAgent'
      * and a paraphrased version of the YUI useragent detection code.
      *
      * @method getUserAgent
      * @private
      */
    function getUserAgent() {

        //no need to run again if ua is already populated.
        if(ua) {
           return;
        }

        var nua = navigator.userAgent, 
            pF = parseFloat,
            m;     

        ua = {
           gecko : 0,
           ie    : 0,  
           opera : 0,
           webkit: 0
        };

        m = nua.match(/AppleWebkit\/(\S*)/);

        if(m && m[1]) {
             ua.webkit = pF(m[1]);
        } else {
             m = nua.match(/MSIE\s([^;]*)/);
             if(m && m[1]) {
                ua.ie = pF(m[1]); 
             } else if((/Gecko\/(\S*)/).test(nua)) {
                ua.gecko = 1;
                m = nua.match(/rv:([^\s\)]*)/);
                if(m && m[1]) {
                   ua.gecko = pF(m[1]); 
                } 
             } else if(m = nua.match(/Opera\/(\S*)/)) {
                   ua.opera = pF(m[1]);
             }
        } 
    }//end function

    /**
      * Loads the specified resources, or the next resource of the specified type
      * in the queue if no resources are specified. If a resource of the specified
      * type is already being loaded, the new request will be queued until the first
      * request has been finished.
      *
      * When an array of resource URLs is specified, these URLs will be loaded in
      * parallel it is possible to do so while preserving execution order. All browsers
      * support parallel loading of CSS, but only Firefox and Opera support parallel loading
      * of scripts. In other browsers than Firefox and Opera, scripts will be queued and loaded
      * one a time to ensure correct execution order.
      *
      * @method load
      * @param (String) type - resouce type ('css' or 'js').
      * @param (String|Array) - urls(optional) URL or array of URLs to load.
      * @param (Function) - callback (optional) callback function to execute when the resouce is loaded.
      * @param (Object) obj - (optional) object to pass to the callback function
      * @param (Object) scope - (optional) if provided, the callback function will be executed in this object's scope.
      * @private
      *  
      */
    function load(type, urls, callback, obj, scope) {
         
        //define some vars
        var i, len, node, p, url;

        //Determine browser type and version
        getUserAgent();

        if(urls) {

            //casts urls to an Array;
            urls = urls.constructor === Array ? urls : [urls];

            //creates a request object for each URL. If multiple URLs are specified
            // the callback function will be executed after all URLs have been loaded.
            //sadly, Firefox and Opera are the only browsers capable of loading scripts
            //in parallel while preserving execution order. In all other browsers, scrips
            //must be loaded sequentially.
            //All browsers respect CSS specificity based on the order of the link elements in the DOM
            //regardless of the order in which the stylesheets are actually downloaded.

            if(type === 'css' || ua.gecko || ua.opera) {

                queue[type].push({
                    urls: [].concat(urls),
                    callback: callback,
                    obj: obj,
                    scope: scope   
                }); 

            } else {

                 for(i = 0, len = urls.length;i < len;i++) {
                    queue[type].push({
                         urls: [urls[i]],
                         callback: i === len-1 ? callback : null,//callback is only added to the last URL
                         obj: obj,
                         scope: scope  
                    });
                }             
            }
            
          }//end if (urls)

        /*
         * If a previous load request of this type is currently in progress, we'll wait our turn,
         *     =>otherwise, grab the next item in the queue! 
         */
 
        if(pending[type] || !(p = pending[type] = queue[type].shift())) {
             return;
        }

        head = head || d.getElementsByTagName('head')[0];
        urls = p.urls;  

        for(i = 0, len = urls.length;i < len; i++) {
                url = urls[i];

                if(type === 'css') {
                  node = createNode('link',{
                         type: 'text/css',
                         charset: 'utf-8',
                         'class': 'lazyload',
                         href: url,
                         rel: 'stylesheet'
                       });
                } else {
                  node = createNode('script',{
                       type: 'text/javascript',
                       charset: 'utf-8',
                       'class': 'lazyload',
                       src: url 
                   });  
                }

                if(ua.ie) {
                    
                     node.onreadystatechange = function() {
                          if(node.readyState === 'loaded' || node.readyState === 'complete') {
                                  this.onreadystatechange = null;
                                  finish(type); 
                          }
                     }

                } else if(type === 'css' && (ua.gecko || ua.webkit)) {

                     //Gecko and WebKit don't support the onload event on link nodes, 
                     //so we just have to finish after a brief delay and hope for the best.
                     setTimeout(function() { finish(type); },50 * len);

                } else {

                     node.onload = node.onerror = function() {finish(type);}  
                }
           
            head.appendChild(node);     
           
        }//end for
    }//end function

    return {
        /**
          * Requests the specified CSS URL or URLs and execute the specified
          * callback (if any) when they have finished loading. If an array of URLs
          * is specified, the stylesheets will be loaded in parallel and the callback
          * will be executed after all stylesheets have finished loading.
          * 
          * Currently, FireFox and WebKit don't provide any way to determine when a 
          * stylesheet has finished loading. In those browsers, the callback function
          * will be executed after a brief delay. 
          * 
          * @method css
          * @param (String | Array)  url CSS URL or array of CSS URLs to load.
          * @param (Function)        callback (optional) callback function to execute when the specified 
          *                          stylesheets are loaded.       
          * @param (Object)          obj (optional) object to pass to the callback function
          * @param (Object)          context (optional) if provided , the callback function 
          *                          will be executed in the object's context  
          * @static 
          */
        css: function(urls, callback, obj, context) {
            load('css', urls, callback, obj, context);              
        },
        /**
          * Requests the specified JavaScript URL or URLs and executes the specified
          * callback (if any) when they have finished loading. If an array of URLs is 
          * specified and the browser supports it, the scripts will be loaded in parallel
          * and the callback (if any) will be executed after all scripts have finished loading.
          *
          * Currently, only Firefox and Opera support parallel loading of scripts while
          * preserving execution order. In other browsers than Firefox and Opera, scripts will 
          * be queued and loaded one at a time to ensure correct execution order.
          *
          * @method js
          * @param (String|Array) urls - (mandatory) JS URL or array of JS URLs to load. 
          * @param (Function) callback - (optional) callback function to execute when the specified scripts are loaded.
          * @param (Object) obj        - (optional) object to pass to the callback function
          * @param (Object) scope      - (optional) if provided, the callback function will be executed in this object's scope.
          * @static
          */
        js: function(urls, callback, obj, context) {
            load('js', urls, callback, obj, context);  
        }
    };
}());