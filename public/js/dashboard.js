//document.addEventListener("DOMContentLoaded", function() {
    const allColors = Object.values(window.theme).reverse();

    // Pie chart
    const pie = document.getElementById("chartjs-dashboard-pie");
    new Chart(pie, {
        type: "pie",
        data: {
            labels: JSON.parse(pie.getAttribute('labels')),
            datasets: [{
                data: JSON.parse(pie.getAttribute('data')),
                backgroundColor: allColors,
                borderWidth: 5
            }]
        },
        options: {
            responsive: !window.MSInputMethodContext,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            cutoutPercentage: 75
        }
    });

    //

    // Doughnut Chart
    const chart = document.getElementById("chartjs-doughnut");
    new Chart(chart, {
        type: "doughnut",
        data: {
            labels: JSON.parse(chart.getAttribute('labels')),
            datasets: [{
                data: JSON.parse(chart.getAttribute('data')),
                backgroundColor: [
                    window.theme.primary,
                    window.theme.success,
                    window.theme.warning,
                    "#dee2e6",
                    ...allColors
                ],
                borderColor: "transparent"
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutoutPercentage: 65,
            legend: {
                display: false
            }
        }
    });

    //

    // Pie chart-2
    const pie2 = document.getElementById("chartjs-pie-2");
    new Chart(pie2, {
        type: "pie",
        data: {
            labels: JSON.parse(pie2.getAttribute('labels')),
            datasets: [{
                data: JSON.parse(pie2.getAttribute('data')),
                backgroundColor: [
                    window.theme.primary,
                    window.theme.warning,
                    window.theme.danger,
                    "#dee2e6",
                    ...allColors
                ],
                borderColor: "transparent"
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            }
        }
    });

    // Polar Area chart
    const polar = document.getElementById("chartjs-polar-area");
    new Chart(polar, {
        type: "polarArea",
        data: {
            labels: JSON.parse(polar.getAttribute('labels')),
            datasets: [{
                label: "Model S",
                data: JSON.parse(polar.getAttribute('data')),
                backgroundColor: [
                    window.theme.primary,
                    window.theme.success,
                    window.theme.danger,
                    window.theme.warning,
                    window.theme.info,
                    ...allColors
                ]
            }]
        },
        options: {
            maintainAspectRatio: false
        }
    });

    var ctx = document.getElementById("chartjs-dashboard-line").getContext("2d");
    var gradient = ctx.createLinearGradient(0, 0, 0, 225);
    gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
    gradient.addColorStop(1, "rgba(215, 227, 244, 0)");
    // Line chart
    new Chart(document.getElementById("chartjs-dashboard-line"), {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                label: "Sales ($)",
                fill: true,
                backgroundColor: gradient,
                borderColor: window.theme.primary,
                data: [
                    2115,
                    1562,
                    1584,
                    1892,
                    1587,
                    1923,
                    2566,
                    2448,
                    2805,
                    3438,
                    2917,
                    3327
                ]
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                intersect: false
            },
            hover: {
                intersect: true
            },
            plugins: {
                filler: {
                    propagate: false
                }
            },
            scales: {
                xAxes: [{
                    reverse: true,
                    gridLines: {
                        color: "rgba(0,0,0,0.0)"
                    }
                }],
                yAxes: [{
                    ticks: {
                        stepSize: 1000
                    },
                    display: true,
                    borderDash: [3, 3],
                    gridLines: {
                        color: "rgba(0,0,0,0.0)"
                    }
                }]
            }
        }
    });

    //

    // Bar chart
    new Chart(document.getElementById("chartjs-dashboard-bar"), {
        type: "bar",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                label: "This year",
                backgroundColor: window.theme.primary,
                borderColor: window.theme.primary,
                hoverBackgroundColor: window.theme.primary,
                hoverBorderColor: window.theme.primary,
                data: [54, 67, 41, 55, 62, 45, 55, 73, 60, 76, 48, 79],
                barPercentage: .75,
                categoryPercentage: .5
            }]
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    stacked: false,
                    ticks: {
                        stepSize: 20
                    }
                }],
                xAxes: [{
                    stacked: false,
                    gridLines: {
                        color: "transparent"
                    }
                }]
            }
        }
    });

    //

    var markers = [{
            coords: [31.230391, 121.473701],
            name: "Shanghai"
        },
        {
            coords: [28.704060, 77.102493],
            name: "Delhi"
        },
        {
            coords: [6.524379, 3.379206],
            name: "Lagos"
        },
        {
            coords: [35.689487, 139.691711],
            name: "Tokyo"
        },
        {
            coords: [23.129110, 113.264381],
            name: "Guangzhou"
        },
        {
            coords: [40.7127837, -74.0059413],
            name: "New York"
        },
        {
            coords: [34.052235, -118.243683],
            name: "Los Angeles"
        },
        {
            coords: [41.878113, -87.629799],
            name: "Chicago"
        },
        {
            coords: [51.507351, -0.127758],
            name: "London"
        },
        {
            coords: [40.416775, -3.703790],
            name: "Madrid "
        }
    ];
    var map = new JsVectorMap({
        map: "world",
        selector: "#world_map",
        zoomButtons: true,
        markers: markers,
        markerStyle: {
            initial: {
                r: 9,
                strokeWidth: 7,
                stokeOpacity: .4,
                fill: window.theme.primary
            },
            hover: {
                fill: window.theme.primary,
                stroke: window.theme.primary
            }
        }
    });
    window.addEventListener("resize", () => {
        map.updateSize();
    });

    document.getElementById("datetimepicker-dashboard").flatpickr({
        inline: true,
        prevArrow: "<span className=\"fas fa-chevron-left\" title=\"Previous month\"></span>",
        nextArrow: "<span className=\"fas fa-chevron-right\" title=\"Next month\"></span>",
    });
//});