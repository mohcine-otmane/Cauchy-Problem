from flask import Flask, request, jsonify
from sympy import symbols, Eq, dsolve, parse_expr, diff

app = Flask(__name__)

@app.route('/guess_solution', methods=['POST'])
def guess_solution():
    data = request.json
    equation = data.get('equation', '')
    x, y = symbols('x y')

    try:
        # Parse the differential equation
        parsed_eq = parse_expr(equation.replace('dy/dx', '').replace('d^2y/dx^2', ''))
        
        # Define the differential equation and solve it
        solution = dsolve(Eq(parsed_eq, 0), y)
        return jsonify({'solution': str(solution)})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(port=5000)
