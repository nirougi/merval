var jQuery = require("jquery");
var Tether = require("tether");
require('bootstrap');
require('vue');

var render = {
    text: function(selector, text){
        $('[data-render='+ selector +']').text(text);
    },
    number: function(selector, number, options){

        if(options == undefined){ options = {}; };
        if(options.color == undefined){ options.color = false; };
        if(options.pre == undefined){ options.pre = ''; };
        if(options.post == undefined){ options.post = ''; };

        if(options.color != false && number > 0){
            $('[data-render='+ selector +']').addClass('text-success');
        }else if(options.color != false && number < 0){
            $('[data-render='+ selector +']').addClass('text-danger');
        }

        if(number > 1000 || number < -1000){
            number = (number/1000).toFixed(2)+'k';
        }else{
            number = number.toFixed(2);
        }
        $('[data-render='+ selector +']').text(options.pre + number + options.post);

    }
}
