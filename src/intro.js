(function(){

  var $env = (function(){
    
    var $env = {};
    var $master;

    var $public = (function(){
      var $public = {};
      return $public;
    }());

    var $platform = function(master){

      var $platform = {};

      $platform.new_split_global_outer = function() {
        return $master.new_split_global_outer();
      };

      $platform.new_split_global_inner = function(proxy) {
        return $master.new_split_global_inner(proxy,undefined);
      };

      $platform.init_window = function(inner) {
        var index = master.next_window_index()+0;
        inner.toString = function(){
          // return "[object Window "+index+"]";
          return "[object Window]";
        };
      };

      return $platform;
    };

    $env.new_window = function(proxy){
      var swap_script_window; // = ( $master.first_script_window.window === proxy );
      if(!proxy){
        proxy = $platform.new_split_global_outer();
      }
      $master.proxy = proxy;
      var new_window = $platform.new_split_global_inner(proxy,undefined);
      new_window.$inner = new_window;
      if(swap_script_window) {
        $master.first_script_window = new_window;
      }
      new_window.$master = $master;
      for(var index in $master.symbols) {
        var symbol = $master.symbols[index];
        new_window[symbol] = $master[symbol];
      }
      return [ proxy, new_window ];
    };

    $env.init = function(){
      $env.$master = $master = this.$master;
      $platform = $platform($master);
      var $inner = this.$inner; 
      var options = this.$options;
      delete $inner.$master;
      delete $inner.$platform;
      delete $inner.$options;
      $inner.$envx = $env;
      $env.init_window.call($inner,$inner,options);
    };

    $env.init_window = function(inner,options){
      var $inner = inner;
      var $w = this;
      
      inner.load = function(){
        for(var i = 0; i < arguments.length; i++){
          var f = arguments[i];
          $master.load(f,inner);
        }
      };
      inner.evaluate = function(string){
        return $master.evaluate.call(string,inner);
      };

      options = options || {};

      var new_opts = {};
      var undef;
      for(var xxx in options){
        if (typeof options[xxx] === "undefined") {
          new_opts[xxx] = undef;
        } else if (options[xxx] === null) {
          new_opts[xxx] = null;
        } else if (typeof options[xxx] == "object" && options[xxx]+"" === "[object split_global]") {
          new_opts[xxx] = options[xxx];
        } else if (typeof options[xxx] == "object" && ((options[xxx]+"").match(/^\[object Window[ 0-9]*\]$/))) {
          new_opts[xxx] = options[xxx];
        } else if (typeof options[xxx] == "string") {
          new_opts[xxx] = options[xxx]+"";
        } else {
          throw new Error("copy "+xxx+ " "+typeof options[xxx] + " " +options[xxx]);
        }
      }

      options = new_opts;

      $platform.init_window($w);

      var print = $master.print;

      // print("set",this);
      // print("set",this.window);
      // print("set",options.proxy);
      // print("set",this === options.proxy);
      if ( !this.window) {
        this.window = this;
      }
      // print("setx",this);
      // print("setx",this.window);
      
      // print("$$w",$w,this,$w.isInner,this.isInner,$w === this);
