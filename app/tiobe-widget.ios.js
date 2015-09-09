//Requiring the http module
var http = require("http");

var httpRequest = null;

var chart;

// The formatter for the XAxis labels
var xFormatter = new NSDateFormatter();
xFormatter.dateFormat = "dd/MM";

//The formatter for the YAxis labels
var yFormatter = new NSNumberFormatter();
yFormatter.numberStyle = NSNumberFormatterCurrencyStyle;
yFormatter.currencySymbol = "$";

//The formatter used to understand the incoming data
var dateReadFormatter = new NSDateFormatter();
dateReadFormatter.dateFormat = "yyyy-MM-dd";

UIViewController.extend({
    viewDidLoad: function() {
        this.super.viewDidLoad();

        //Setting up the chart
        if (!chart) {
            chart = TKChart.alloc().initWithFrame(CGRectMake(0, 0, this.view.frame.size.width, 150));

            chart.plotView.backgroundColor = UIColor.clearColor();
            chart.backgroundColor = UIColor.clearColor();

            chart.gridStyle.horizontalFill = null;
            chart.gridStyle.horizontalAlternateFill = null;
        }
        this.view.addSubview(chart);

        this.preferredContentSize = CGSizeMake(0, 150);
    },
    //Removing any redundant margins
    widgetMarginInsetsForProposedMarginInsets: function(defaultMarginInsets) {
        return UIEdgeInsetsZero;
    },
    didReceiveMemoryWarning: function() {
        this.super.didReceiveMemoryWarning();
    },
    widgetPerformUpdateWithCompletionHandler: function(completionHandler) {
        function twoDigit(n) {
            return n < 10 ? ("0" + n.toString()) : n.toString(); 
        }

        var today = new Date();
        var toDate = today.getFullYear() + "-" + twoDigit(today.getMonth() + 1) + "-" + twoDigit(today.getDate());
        var twoWeeksAgo = new Date(today.getTime() - 2 * 7 * 24 * 3600000);
        var fromDate = twoWeeksAgo.getFullYear() + "-" + twoDigit(twoWeeksAgo.getMonth() + 1) + "-" + twoDigit(twoWeeksAgo.getDate());

        console.log("Request data for " + fromDate + " to " + toDate);
        var url = "https://query.yahooapis.com/v1/public/yql?q=select%20Date%2C%20Open%2C%20High%2C%20Low%2C%20Close%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22PRGS%22%20and%20startDate%20%3D%20%22" + fromDate + "%22%20and%20endDate%20%3D%20%22" + toDate + "%22&format=json&env=http%3A%2F%2Fdatatables.org%2Falltables.env&vm=r&callback=";
                        
        http.getJSON(url).then(function (r) {
            try {
                var points = r.query.results.quote;
                console.log("Stocks: " + JSON.stringify(r));

                var minLow = Number.POSITIVE_INFINITY;
                var maxHigh = Number.NEGATIVE_INFINITY;

                var dataPoints = points.map(function(data, index) {
                    var x = dateReadFormatter.dateFromString(data.Date);
                    var open = NSNumber.numberWithDouble(data.Open);
                    var high = NSNumber.numberWithDouble(data.High);
                    var low = NSNumber.numberWithDouble(data.Low);
                    var close = NSNumber.numberWithDouble(data.Close);

                    minLow = Math.min(minLow, data.Low);
                    maxHigh = Math.max(maxHigh, data.High);

                    console.log("Point: " + x + " - " + open + " " + high + " " + low + " " + close);
                    return TKChartFinancialDataPoint.dataPointWithXOpenHighLowClose(x, open, high, low, close);
                });

                var minLow = Math.floor(minLow);
                var maxHigh = Math.ceil(maxHigh);

                var financialSeries = TKChartCandlestickSeries.alloc().initWithItems(dataPoints);
                               
                chart.removeAllData();
                chart.addSeries(financialSeries);

                var xAxis = chart.xAxis;
                xAxis.minorTickIntervalUnit = TKChartDateTimeAxisIntervalUnitDays;
                xAxis.plotMode = TKChartAxisPlotModeBetweenTicks;
                xAxis.labelFormatter = xFormatter;
                xAxis.majorTickInterval = 3;
                xAxis.style.labelStyle.textColor = UIColor.whiteColor();

                var yAxis = chart.yAxis;
                yAxis.range = TKRange.rangeWithMinimumAndMaximum(minLow, maxHigh);
                yAxis.majorTickInterval = (maxHigh - minLow) / 4;
                yAxis.labelFormatter = yFormatter;

                yAxis.style.labelStyle.textColor = UIColor.whiteColor();
                yAxis.style.labelStyle.firstLabelTextAlignment = TKChartAxisLabelAlignmentLeft | TKChartAxisLabelAlignmentTop;
                yAxis.style.labelStyle.firstLabelTextOffset = { horizontal: 4, vertical: 0 };

                chart.update();
                               
                completionHandler(NCUpdateResultNewData);
            } catch(e) {
            }
        }, function (e) {
        });
    }
}, {
    name: "TodayViewController",
    protocols: [NCWidgetProviding]
});