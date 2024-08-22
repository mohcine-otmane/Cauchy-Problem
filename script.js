function solveCauchyProblem() {
    const equationInput = document.getElementById('equation').value;
    const y0 = parseFloat(document.getElementById('y0').value);
    const iterations = parseInt(document.getElementById('iterations').value);
    const h = parseFloat(document.getElementById('interval').value);

    const solution = [];
    let x = 0;
    let y = y0;

    for (let i = 0; i < iterations; i++) {
        solution.push(`x = ${x.toFixed(2)}, y = ${y.toFixed(4)}`);

        // Parse and evaluate the equation
        const fxy = eval(equationInput.replace(/x/g, x).replace(/y/g, y));
        
        // Euler's method
        y = y + h * fxy;
        x = x + h;
    }

    document.getElementById('solution').textContent = solution.join('\n');
}
