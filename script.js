const pythonServerURL = 'http://localhost:5000/guess_solution';

let chart;

// Function to evaluate the nth derivative using Newton's limit definition
function derivative(f, x, h = 1e-5, n = 1) {
    if (n === 1) {
        return (f(x + h) - f(x)) / h;
    } else if (n === 2) {
        return derivative(x => derivative(f, x, h), x, h);
    } else {
        return derivative(x => derivative(f, x, h, n - 1), x, h);
    }
}

// Function to parse the equation
function preprocessEquation(equationInput) {
    const terms = equationInput.split(/(?=\+|\-)/).map(term => term.trim()).filter(Boolean);
    const parsedTerms = [];
    let maxOrder = 0;
    
    terms.forEach(term => {
        if (term.includes('d^2y/dx^2')) {
            maxOrder = Math.max(maxOrder, 2);
            const funcBody = term.replace(/d\^2y\/dx\^2\s*=\s*/, '');
            parsedTerms.push({ order: 2, func: new Function('x', `return ${funcBody};`) });
        } else if (term.includes('dy/dx')) {
            maxOrder = Math.max(maxOrder, 1);
            const funcBody = term.replace(/dy\/dx\s*=\s*/, '');
            parsedTerms.push({ order: 1, func: new Function('x', `return ${funcBody};`) });
        } else {
            const funcBody = term;
            parsedTerms.push({ order: 0, func: new Function('x', `return ${funcBody};`) });
        }
    });

    // Return the parsed function and the maximum derivative order
    return { terms: parsedTerms, maxOrder };
}

// Function to solve the Cauchy problem
function solveCauchyProblem() {
    console.log('Solve button clicked'); // Debug statement

    const equationInput = document.getElementById('equation').value;
    const y0 = parseFloat(document.getElementById('y0').value);
    const iterations = parseInt(document.getElementById('iterations').value);
    const h = parseFloat(document.getElementById('interval').value);

    console.log('Inputs:', equationInput, y0, iterations, h); // Debug statement

    if (!equationInput || isNaN(y0) || isNaN(iterations) || isNaN(h)) {
        console.error('Invalid input');
        document.getElementById('solution').textContent = 'Please provide valid inputs.';
        return;
    }

    const solution = [];
    const xValues = [];
    const yValues = [];
    let x = 0;
    let y = y0;
    let y1 = y0; // For handling second-order equations

    // Preprocess the equation
    const { terms, maxOrder } = preprocessEquation(equationInput);

    try {
        for (let i = 0; i < iterations; i++) {
            solution.push(`x = ${x.toFixed(2)}, y = ${y.toFixed(4)}`);
            xValues.push(x.toFixed(2));
            yValues.push(y.toFixed(4));

            let f = 0;
            if (maxOrder >= 2) {
                f += terms.filter(term => term.order === 2).reduce((acc, term) => acc + term.func(x), 0);
            }
            if (maxOrder >= 1) {
                f += terms.filter(term => term.order === 1).reduce((acc, term) => acc + term.func(x), 0);
            }
            f += terms.filter(term => term.order === 0).reduce((acc, term) => acc + term.func(x), 0);
            
            if (maxOrder === 2) {
                y1 += h * f;
                y += h * y1;
            } else {
                y += h * f;
            }
            
            x += h;
        }
    } catch (error) {
        console.error('Error evaluating equation:', error);
        document.getElementById('solution').textContent = `Error evaluating equation: ${error.message}`;
        return;
    }

    document.getElementById('solution').textContent = solution.join('\n');
    plotSolution(xValues, yValues);
    guessAnalyticalSolution(equationInput);
}

// Function to plot the solution
function plotSolution(xValues, yValues) {
    const ctx = document.getElementById('solutionPlot').getContext('2d');
    
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

// Function to guess the analytical solution (placeholder)
async function guessAnalyticalSolution(equationInput) {
    try {
        const response = await fetch(pythonServerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ equation: equationInput })
        });

        const data = await response.json();
        const guess = data.solution || 'Analytical form guess not available.';
        document.getElementById('guess').textContent = guess;
    } catch (error) {
        document.getElementById('guess').textContent = 'Error retrieving solution.';
        console.error('Error fetching from Python server:', error);
    }
}
