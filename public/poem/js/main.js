
var COLORS = ["F6FF94", "C1FF94", "94FF9D", "FF9D94", "FFB957", "94FFD2", "C3FF7A", "81FF7A", "7AFFF8"];
var MAX_DIST = 2;
var WIKI_API = "http://en.wikipedia.org/w/api.php?";

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function loadQtips(qtips, par1) {
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

    function makeContent(curAnalysis, title) {
      var content = {};
      if (curAnalysis.hasOwnProperty('url')) {
        content.text = "Loading...";
        content.ajax =
          {
            url: '/poem/search',
            type: 'POST',
            data: {
              string:curAnalysis.text
            },
            success: function(data, status) {
              // Process the data
              // data = '<div id="' + selector + '">' + data + "</div>";
              data = data.replace(new RegExp('<p>', 'g'), '<p style="margin:10">');
              var element = $("<div>").append(jQuery.parseHTML(data));
              // Set the content manually (required!)
              this.set('content.text',data);
            }
          }
      } else {
        content.text = curAnalysis.text.trim();
      }
      content.title = {text:title};
      return content;
    }

    // make the qtip effect
    var makeQtip = function(id, analysis, clickNum) {
        var text, title;
        var curAnalysis = analysis[clickNum];
        var title = (clickNum+1)+"/"+(analysis.length);

        var content = makeContent(curAnalysis, title);

        function makeTag(content) {

          $(id).qtip({
              content: content,
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
        }
        makeTag(content);
        var oldClass;
        function setColor() {
            var sentence = curAnalysis.sentence;
            var paragraph = curAnalysis.paragraph;
            color = COLORS[paragraph%COLORS.length];
            color = ColorLuminance('#' + color, 2*sentence/7 % 0.4);
            className = "s" + sentence + "-p" + paragraph;

            if (oldClass) {
                $(id).removeClass(oldClass);
            }
            $(id).addClass(className);
            oldClass = className;

            // var prevColor = $("." + id).css("background-color");
            // if (prevColor != "rgba(0, 0, 0, 0)" && !redo) {
            //     return;
            // }

            if (sentence != -1 && paragraph != -1) {
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
                      $("." + className).each(function() {
                          $(this).css({'backgroundColor':newColor});
                      });
                  }, function() {
                      $("." + className).each(function() {
                          $(this).css({'backgroundColor':"#" + color});
                      });
                  });
              })(color, className);
            } else {
              $(id).css({
                  "background-color":"",
                  "font-weight":"bold",
                  "cursor":"default"
              });
            }
        }

        setColor();

        $(id).click(function() {
            clickNum = (clickNum+1)%analysis.length;
            var title = (clickNum+1)+"/"+(analysis.length);
            curAnalysis = analysis[clickNum];
            setColor();
            content = makeContent(analysis[clickNum], title);
            if (analysis[clickNum].sentence != -1) {
              $(this).qtip('options', {
                  'content.title.text': content.text,
                  'content.title': content.title.text
              });
            } else {
              if (oldClass) {
                $(id).removeClass(oldClass);
              }
              makeTag(content);
            }
        });
    };

    var word, dist, regex, quoteLen, wordList, replaceStr, analysis, id, foundMatch;
    var allClasses = {};
    var tasks=[];
    // qtips = {"quote": {text:"", paragraph:1, sentence:3}}
    // Go through the qtips and generate the things we will add to the qtips
    k = 0;
    for (var quote in qtips) {
        analysis = qtips[quote];
        quote = quote.replace( /"/g, "");
        if (quote.length <= 2)
            continue;

        quoteLen = quote.split(" ").length;
        wordList = wordsOfLength[quoteLen];

        for (j = 0; j < wordList.length; j++) {
            word = wordList[j];
            dist = getEditDistance(word.toLowerCase(), quote);
            if (dist <= Math.max(0, Math.min(word.length-5, MAX_DIST))) {
                id = "id-" + k;
                replaceStr = '<span id="' + id + '">$&</span>';
                html = $('#lyrics').html().replace(new RegExp(word, 'g'), replaceStr);
                $('#lyrics').html(html);
                tasks.push({id:id, analysis:analysis});
                k++;
            }
        }
    }
    var authorName = $('#id-author').text();
    var authorAnalysis = {
      text:authorName,
      url:true,
      sentence:-1,
      paragraph:-1
    };
    tasks.push({id:'id-author', analysis:[authorAnalysis]});

    if (par1 !== "") {
      var titleAnalysis = {
        text:par1,
        sentence:-2,
        paragraph:-1
      };

      tasks.push({id:'id-title', analysis:[titleAnalysis]});
    }
    for (i = 0; i < tasks.length; i++) {
        makeQtip('#' + tasks[i].id, tasks[i].analysis, 0);
    }
    console.log($('#lyrics').html());
}

var l;
var text = "";

var loadMainPage = function() {
    var html = new EJS({url: 'templates/main.ejs'}).render({text:text});
    $('#variable').hide().html(html).fadeIn('slow');
    $('#header').hide().text("Explicate").fadeIn('slow');
    pageLoaded();
};

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
    $('#return').click(loadMainPage);
    $('#header').click(loadMainPage);
}

$(document).ready(pageLoaded);

var enterFunc = function() {
    text = document.getElementById("input").value;
    $('#return').click(loadMainPage);
    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        cache: false,
        data: { input:text },
        success: function(data) {
            var html = new EJS({url: 'templates/annotate.ejs'}).render(data);
            $('#variable').html(html);
            $('#variable').hide().html(html).fadeIn('slow');
            $('#header').hide().text("Annotate").fadeIn('slow');
            $('#return').click(loadMainPage);
            loadQtips(data.qtips, data.par1);
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