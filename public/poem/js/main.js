
var COLORS = ["F6FF94", "C1FF94", "94FF9D", "FF9D94", "FFB957", "94FFD2", "C3FF7A", "81FF7A", "7AFFF8"];
var MAX_DIST = 2;

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function loadQtips(qtips) {
    var i, j, k;
    var text = $('#lyrics').text();
    var allWords = text.replace( /\n/g, " " ).split(" ");
    var wordsOfLength = new Array(21);
    var result, string;
    for (i = 1; i < 20; i++) {
        result = [];
        for (j = 0; j <= allWords.length-i; j++) {
            string = "";
            for (k = 0; k < i; k++) {
                string += allWords[j+k] + " ";
            }
            result.push(string.trim());
        }
        wordsOfLength[i] = result;
    }

    // make the qtip effect
    var makeQtip = function(id, analysis, clickNum) {
        var text, title;
        function setT() {
            text = analysis[clickNum].text.trim();
            title = (clickNum+1)+"/"+(analysis.length);
        }
        setT();
        $(id).qtip({
            content: {
                text: text,
                title: {
                    text:title
                }
            },
            style: {
                classes:"qtip-light",
            },
            show: {
                solo:true
            },
            hide: {
                fixed: true,
                delay: 100
            },
            position: {
                adjust: {
                    x: 40
                }
            }
        });
        var oldClass;
        function setColor() {
            var sentence = analysis[clickNum].sentence;
            var paragraph = analysis[clickNum].paragraph;
            color = COLORS[paragraph%COLORS.length];
            color = ColorLuminance('#' + color, 2*sentence/7 % 0.4);
            className = ".s" + sentence + "-p" + paragraph;

            if (oldClass) {
                $(id).removeClass(oldClass);
            }
            $(id).addClass(className);
            oldClass = className;

            // var prevColor = $("." + id).css("background-color");
            // if (prevColor != "rgba(0, 0, 0, 0)" && !redo) {
            //     return;
            // }

            $(id).css({
                "background-color":"#" + color,
                "border-radius":"3px",
                "padding":"2px",
                "cursor":"default"
            });
            // console.log("#" +color);
            (function(color, className) {
                var newColor = ColorLuminance(color, -0.2);
                $(id).hover(function() {
                    $(className).each(function() {
                        $(this).css({'backgroundColor':newColor});
                    });
                }, function() {
                    $(className).each(function() {
                        $(this).css({'backgroundColor':"#" + color});
                    });
                });
            })(color, className);
        }
        setColor();
        $(id).click(function() {
            clickNum = (clickNum+1)%analysis.length;
            setT();
            setColor();
            $(this).qtip('options', {
                'content.title': title,
                'content.title.text': text
            });
        });
    };

    var word, dist, regex, quoteLen, wordList, replaceStr, analysis, id, foundMatch;
    var allClasses = {};
    var tasks=[];
    // qtips = {"quote": {text:"", paragraph:1, sentence:3}}
    // Go through the qtips and generate the things we will add to the qtips
    for (var quote in qtips) {
        analysis = qtips[quote];
        quote = quote.substring(1, quote.length-1);
        if (quote.length <= 2)
            continue;

        quoteLen = quote.split(" ").length;
        wordList = wordsOfLength[quoteLen];

        for (j = 0; j < wordList.length; j++) {
            id = "rand-" + makeid();
            replaceStr = '<span id="' + id + '">$&</span>';
            foundMatch = false;
            word = wordList[j];
            dist = getEditDistance(word.toLowerCase(), quote);
            if (dist <= Math.max(0, Math.min(word.length-5, MAX_DIST))) {
                html = $('#lyrics').html().replace(new RegExp(word, 'g'), replaceStr);
                $('#lyrics').html(html);
                tasks.push({id:id, a:analysis});
            }
        }
    }
    for (i = 0; i < tasks.length; i++) {
        makeQtip('#' + tasks[i].id, tasks[i].a, 0);
    }

    console.log($('#lyrics').html());
}

var l;
var text = "";
$(document).ready(pageLoaded);

function pageLoaded() {
    l = Ladda.create( document.getElementById( 'enter' ) );
    $.ajaxSetup({

      beforeSend:function(){
        l.start();
      },
      complete:function(){
        l.stop();
      }
    });
    $('#enter').click(enterFunc);
}

var loadMainPage = function() {
    var html = new EJS({url: 'templates/main.ejs'}).render({text:text});
    $('#variable').hide().html(html).fadeIn('slow');
    $('#header').hide().text("Explicate").fadeIn('slow');
    $('#header').click(loadMainPage);
    pageLoaded();
};

var enterFunc = function() {
    text = document.getElementById("input").value;
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        cache: false,
        data: { input:text },
        success: function(data) {
            var html = new EJS({url: 'templates/annotate.ejs'}).render(data);
            $('#variable').html(html);
            $('#variable').hide().html(html).fadeIn('slow');
            $('#return').click(loadMainPage);
            $('#header').hide().text("Annotate").fadeIn('slow');
            loadQtips(data.qtips);
        },
        error: function(jqXHR, textStatus, err) {
            alert('text status '+textStatus+', err '+err);
        }
    });
};

$(document).delegate('#input', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});