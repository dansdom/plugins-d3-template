// extend code
// https://github.com/dansdom/extend
Extend = Extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=Extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// D3 plugin template
(function (d3) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    d3.TestPlugin = function (options, element, callback)
    {
        // wrap the element in the jQuery object
        this.el = element;

        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "testPlugin";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        // using the extend code that I ripped out of jQuery
        this.opts = Extend(true, {}, d3.TestPlugin.settings, options);
        this.init();
        // run the callback function if it is defined
        if (typeof callback === "function")
        {
            callback.call();
        }
    };
    
    // these are the plugin default settings that will be over-written by user settings
    d3.TestPlugin.settings = {
        'height': '930',
        'width': '960',
        'margin': {top: 30, right: 10, bottom: 10, left: 30}
    };
    
    // plugin functions go here
    d3.TestPlugin.prototype = {
        init : function() {
            // going to need to define this, as there are some anonymous closures in this function.
            // something interesting to consider
            var container = this; 

            var margin = this.opts.margin,
                width = this.opts.width - margin.right - margin.left,
                height = this.opts.height - margin.top - margin.bottom;

            var format = d3.format(",.0f");

            var x = d3.scale.linear()
                .range([0, width]);

            var y = d3.scale.ordinal()
                .rangeRoundBands([0, height], .1);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("top")
                .tickSize(-height);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickSize(0);

            container.chart = d3.select(container.el).append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            d3.csv("sample-data.csv", function(data) {

                // Parse numbers, and sort by value.
                data.forEach(function(d) { d.value = +d.value; });
                data.sort(function(a, b) { return b.value - a.value; });

                // Set the scale domain.
                x.domain([0, d3.max(data, function(d) { return d.value; })]);
                y.domain(data.map(function(d) { return d.name; }));

                var bar = container.chart.selectAll("g.bar")
                    .data(data)
                    .enter().append("g")
                    .attr("class", "bar")
                    .attr("transform", function(d) { return "translate(0," + y(d.name) + ")"; });

                bar.append("rect")
                    .attr("width", function(d) { return x(d.value); })
                    .attr("height", y.rangeBand());

                bar.append("text")
                    .attr("class", "value")
                    .attr("x", function(d) { return x(d.value); })
                    .attr("y", y.rangeBand() / 2)
                    .attr("dx", -3)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "end")
                    .text(function(d) { return format(d.value); });

                container.chart.append("g")
                    .attr("class", "x axis")
                    .call(xAxis);

                container.chart.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);
            });
        },
        settings : function(settings) {
            var plugin = this;
            this.opts = Extend(true, {}, this.opts, settings);
            // the destroy/init will need to change to a transition event
            this.destroy();
            // why does this need a timeout? I wonder
            setTimeout(function() {
                plugin.init();
                plugin.el.setAttribute(this.namespace, true);
            }, 200); 
        },
        destroy : function() {
            this.el.removeAttribute(this.namespace);
            this.el.removeChild(this.el.children[0]);
            //debugger;
        }     
    };
    
    // the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
    // props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
    d3.testPlugin = function(element, options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "testPlugin",
            args;

        function applyPluginMethod(el) {
            var pluginInstance = el[pluginName];   
            // if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
            if (!pluginInstance) {
                alert("The plugin has not been initialised yet when you tried to call this method: " + options);
                //return;
            }
            // if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
            if (typeof pluginInstance[options] !== "function" || options.charAt(0) === "_") {
                alert("the plugin contains no such method: " + options);
                //return;
            }
            // apply the method that has been called
            else {
                pluginInstance[options].apply(pluginInstance, args);
            }
        };

        function initialisePlugin(el) {
            // define the data object that is going to be attached to the DOM element that the plugin is being called on
            // need to create a global data holding object. 
            var pluginInstance = el[pluginName];
            // if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
            if (pluginInstance) {
                // going to need to set the options for the plugin here
                pluginInstance.settings(options);
            }
            // initialise a new instance of the plugin
            else {
                el.setAttribute(pluginName, true);
                // I think I need to anchor this new object to the DOM element and bind it
                el[pluginName] = new d3.TestPlugin(options, el, callback);
            }
        };
        
        // if the argument is a string representing a plugin method then test which one it is
        if ( typeof options === 'string' ) {
            // define the arguments that the plugin function call may make 
            args = Array.prototype.slice.call(arguments, 2);
            // iterate over each object that the function is being called upon
            if (element.length) {
                for (var i = 0; i < element.length; i++) {
                    applyPluginMethod(element[i]);
                };
            }
            else {
                applyPluginMethod(element);
            }
            
        }
        // initialise the function using the arguments as the plugin options
        else {
            // initialise each instance of the plugin
            if (element.length) {
                for (var i = 0; i < element.length; i++) {
                    initialisePlugin(element[i]);
                }
            }
            else {
                initialisePlugin(element);
            }
        }
        return this;
    };

    // end of module
})(d3);
