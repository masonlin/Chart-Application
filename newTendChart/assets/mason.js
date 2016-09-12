/*******************************************
  Get JSON data START
********************************************/
let aryNews = [];
let aryStock = [];
let aryTargetNews = [];
let aryTargetStock = [];

$.getJSON("./assets/HTC_2015.json", function(json_v) {
  // let items = [];
  $.getJSON("./assets/htc_news.json", function(json_n) {
    //htc news data
    for(let i = 0; i < json_n.news.length; i++){
      let sTemp = {headline: json_n.news[i].headline,
                   datetime_local: json_n.news[i].datetime_local,
                   content: json_n.news[i].content};
      aryNews.push(sTemp);
    }

    //htc values data
    for(let i = 0; i< json_v.quote.length; i++){
      let sValueTemp = {
                      'content': `Symbol:    ${json_v.quote[i].Symbol} <BR>
                                  Date:      ${json_v.quote[i].Date} <BR>
                                  Open:      ${json_v.quote[i].Open} <BR>
                                  High:      ${json_v.quote[i].High} <BR>
                                  Low:       ${json_v.quote[i].Low} <BR>
                                  Close:     ${json_v.quote[i].Close} <BR>
                                  Volume:    ${json_v.quote[i].Volume} <BR>
                                  Adj_Close: ${json_v.quote[i].Adj_Close}`,
                        'Date': json_v.quote[i].Date,
                        'Close': parseFloat(json_v.quote[i].Close),
                       };
      aryStock.push(sValueTemp);

    }


    /*******************************************
      Draw Chart START
    ********************************************/
    var chart = c3.generate({
      bindto: '#chart',
      data: {
        json: aryStock,
        keys: {
          x: 'Date',
          value: ['Close'],
        },
        onclick: function (d, element) {
          DataClick(d, element)
        },
        selection: {
          enabled: true,
          multiple: false,
          isselectable: function (d) {
            // console.log(d);
          },
        },
        labels: false
      },
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
        }
      },
      regions: getDatetimeRegionsList('2013/01/01', 48, 2),
      zoom: {
        enabled: true,
        rescale: true,
      },
      legend: {
        position: 'right'
      },
      size: {
        height: 480,
        width: 1224,
      },
      padding: {
        right: 80,
        left: 80,
        bottom: 20,
        top: 20
      },
      transition: {
        duration: 500
      },
      point: {
        show: true,
        r: 0,
        focus: {
          expand: {
            r: 8
          }
        },
        select: {
          r: 10
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          // padding: {top:100, bottom:100},
          tick: {
              format: '%Y-%m-%d',
              rotate: 35,
              fit: false,
          },
          label: {
            text: 'Date',
            position: 'inner-right'
          },
          // extent: [1, 10],
        },
        y: {
          padding: {top:10, bottom:10},
          tick: {
              format: d3.format("$,"),
          },
          label: {
            text: 'Price',
            position: 'outer-middle'
          },
        },
      }
    });
    /*******************************************
      Draw Chart END
    ********************************************/





  });
});
/*******************************************
  Get JSON data END
********************************************/


/*******************************************
  Popup Detail START
********************************************/
function DataClick(d, element) {
  let colseValue = d.value;
  let dateStock = dateFormate(d.x, '-', true);
  let dateNews = dateFormate(d.x, '/', false);

  //find out the all news and stock price from aryNews and aryStock
  aryTargetNews = [];
  for(let i=0; i<aryNews.length; i++){
      if(aryNews[i].datetime_local==dateNews){
          aryTargetNews.push(aryNews[i]);
      }
  }
  // console.log(aryTargetNews);

  aryTargetStock = [];
  for(let i=0; i<aryStock.length; i++){
    if(aryStock[i].Date==dateStock){
        aryTargetStock.push(aryStock[i]);
    }
  }
  // console.log(aryTargetStock);


  let msg = dateNews + ' HTC Information';
  let innerData = '';
  if(aryTargetStock[0] != undefined){
    innerData = (aryTargetStock[0].content==undefined?'':(aryTargetStock[0].content + '<br><hr>'));
  }

  for(let i=0; i<aryTargetNews.length;i++){
    if(i==0){
      innerData += `<input type="radio" name="headline" value="${aryTargetNews[i].content}" checked="checked">` + aryTargetNews[i].headline + '<br>';
    }else{
      innerData += `<input type="radio" name="headline" value="${aryTargetNews[i].content}">` + aryTargetNews[i].headline + '<br>';
    }
  }

  drawPopup(msg,innerData);

}


function drawPopup(msg, innerData, isCloseLook = false){
  todayDateString = new Date().toJSON().slice(0, 10)
  let aryInput = [
      '<div class="vex-custom-field-wrapper">',
          '<div class="vex-custom-input-wrapper">',
              // radios,
          '</div>',
      '</div>'
  ];

  aryInput.splice(12,0,innerData);

  vex.dialog.buttons.YES.text = 'Look';
  vex.dialog.buttons.NO.text = 'Close';

  vex.dialog.open({
      message: msg,
      className: 'vex-theme-default',
      overlayClosesOnClick: true,

      input: aryInput.join(''),
      callback: function (data) {
          if (!data) {
            return console.log('Cancelled');
          }

          if (data.headline==undefined){
            return null;
          }

          vex.dialog.buttons.YES.text = 'OK';
          vex.dialog.alert({
              className: 'vex-theme-default',
              // message: replaceHTML(data.headline),
              // input: aryInput2.join(''),
              input: replaceHTML(data.headline),
              callback: () => {}
          })


      }
  })
}
/*******************************************
  Popup Detail END
********************************************/


/*******************************************
  Utility Functions START
********************************************/
function getDatetimeRegionsList(startDatetime, months, jumpMonths){
  // regions: [{axis: 'x', start: '2014-09-01', end: '2014-10-01', class: 'regionX'}];
  let regions = [];
  let tempObj = {};
  let startDate = '';
  let endDate = '';
  let CurrentDate = new Date(startDatetime);

  for(let i = 0; i < months; i += jumpMonths){
    startDate = dateFormate(CurrentDate.setMonth(CurrentDate.getMonth() + jumpMonths - 1), '-', true);
    endDate = dateFormate(CurrentDate.setMonth(CurrentDate.getMonth() + jumpMonths - 1), '-', true);

    tempObj = {
      axis: 'x',
      start: startDate,
      end: endDate,
      class: 'regionX'
    };

    regions.push(tempObj);
  }
  // console.log(regions);
  return regions;
}

function dateFormate(strDate,separate,isPad) {
  let mydate = new Date(strDate);
  let yyyy = mydate.getFullYear();
  let mm = '';
  let dd = '';
  if(isPad){
    mm = padLeft(mydate.getMonth()+1,2);
    dd = padLeft(mydate.getDate(),2);
  }else{
    mm = mydate.getMonth()+1;
    dd = mydate.getDate();
  }
  return yyyy + separate + mm + separate + dd;
}

function padLeft(str, len) {
    str = '' + str;
    if (str.length >= len) {
        return str;
    } else {
        return padLeft("0" + str, len);
    }
}

function replaceHTML(text){
  text = text.replace(/&lt;BR&gt;/g,'<BR>');
  // text = text.replace(/&lt;BR&gt;/g,'】');
  // text = "<p style='text-align: left;'>" + text + "</p>"
  return text;
}

function isEmptyObject(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

/*******************************************
  Utility Functions END
********************************************/

// console.log(chart);
// console.log(aryStock);
// console.log(aryStock);
