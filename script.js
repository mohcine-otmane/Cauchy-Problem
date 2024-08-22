let chart = null;  // Declare a global variable to store the chart instance

function solveCauchyProblem() {
    const equationInput = document.getElementById('equation').value;
    const y0 = parseFloat(document.getElementById('y0').value);
    const iterations = parseInt(document.getElementById('iterations').value);
    const h = parseFloat(document.getElementById('interval').value);

    const solution = [];
    const xValues = [];
    const yValues = [];
    let x = 0;
    let y = y0;

    for (let i = 0; i < iterations; i++) {
        solution.push(`x = ${x.toFixed(2)}, y = ${y.toFixed(4)}`);
        xValues.push(x.toFixed(2));
        yValues.push(y.toFixed(4));

        // Parse and evaluate the equation
        const fxy = eval(equationInput.replace(/x/g, x).replace(/y/g, y));
        
        // Euler's method
        y = y + h * fxy;
        x = x + h;
    }

    document.getElementById('solution').textContent = solution.join('\n');
    plotSolution(xValues, yValues);
}

function plotSolution(xValues, yValues) {
    const ctx = document.getElementById('solutionPlot').getContext('2d');
    
    // Destroy existing chart if it exists to clear the canvas
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: 'y(x)',
                data: yValues,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'y'
                    }
                }
            }
        }
    });
}
