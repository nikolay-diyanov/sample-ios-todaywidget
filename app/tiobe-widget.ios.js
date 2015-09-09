var chart;

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
    //Refilling chart with data when an update is needed
    widgetPerformUpdateWithCompletionHandler: function(completionHandler) {
        var dataPoints = [TKChartDataPoint.alloc().initWithXY("C++", 6.782),
                          TKChartDataPoint.alloc().initWithXY("JS", 2.342),
                          TKChartDataPoint.alloc().initWithXY("C#", 4.909),
                          TKChartDataPoint.alloc().initWithXY("Java", 19.565),
                          TKChartDataPoint.alloc().initWithXY("Python", 3.664),
                          TKChartDataPoint.alloc().initWithXY("PHP", 2.530),
                          TKChartDataPoint.alloc().initWithXY("C", 15.621)];

        var tiobeColumnSeries = TKChartColumnSeries.alloc().initWithItems(dataPoints);
        chart.addSeries(tiobeColumnSeries);

        var xAxis = chart.xAxis;
        xAxis.minorTickIntervalUnit = TKChartDateTimeAxisIntervalUnitDays;
        xAxis.style.labelStyle.textColor = UIColor.whiteColor();

        var yAxis = chart.yAxis;
        yAxis.majorTickInterval = 5;

        yAxis.style.labelStyle.textColor = UIColor.whiteColor();
        yAxis.style.labelStyle.firstLabelTextAlignment = TKChartAxisLabelAlignmentLeft | TKChartAxisLabelAlignmentTop;
        yAxis.style.labelStyle.firstLabelTextOffset = { horizontal: 4, vertical: 0 };

        chart.update();
                       
        completionHandler(NCUpdateResultNewData);
    }
}, {
    name: "TodayViewController",
    protocols: [NCWidgetProviding]
});