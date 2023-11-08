document.addEventListener('DOMContentLoaded', function() {
    const calculateButton = document.getElementById('calculate-button');
    calculateButton.addEventListener('click', function() {
        // Get user inputs
        const units = document.getElementById('units').value;
        const thermometerType = document.getElementById('thermometer-type').value;
        const nominalResistance = parseFloat(document.getElementById('nominal-resistance').value);
        const resistanceInput = parseFloat(document.getElementById('resistance-input').value);
        const temperatureInput = parseFloat(document.getElementById('temperature-input').value);

        // Constants based on thermometer type
        const constants = {
            'PT-385': {
                A: 3.9083e-3,
                B: -5.775e-7,
                C: (temperatureInput < 0) ? -4.183e-12 : 0
            },
            'PT-392': {
                A: 3.9827e-3,
                B: -5.875e-7,
                C: (temperatureInput < 0) ? -4.171e-12 : 0
            }
        };

        // Select constants for current thermometer type
        const { A, B, C } = constants[thermometerType];

        // Function to convert Celsius to Fahrenheit
        function celsiusToFahrenheit(celsius) {
            return (celsius * 9/5) + 32;
        }

        // Function to convert Celsius to Kelvin
        function celsiusToKelvin(celsius) {
            return celsius + 273.15;
        }

        // Calculate temperature from resistance, assuming T >= 0°C
        function calculateTemperature(R, unit) {
            const R0 = nominalResistance; // 100 ohms for PT100
            const A = thermometerType === 'PT-385' ? 3.9083e-3 : 3.9827e-3;
            const B = thermometerType === 'PT-385' ? -5.775e-7 : -5.875e-7;

            // Using the quadratic formula to solve for t, where R = R0 (1 + At + Bt^2)
            // Since we expect t to be positive, we use the positive root of the quadratic formula
            const sqrtTerm = Math.sqrt(A * A - 4 * B * (1 - R / R0));
            const t = (-A + sqrtTerm) / (2 * B);
            
            // Convert the temperature based on the selected unit
            switch(unit) {
                case 'Fahrenheit':
                    return celsiusToFahrenheit(t);
                case 'Kelvin':
                    return celsiusToKelvin(t);
                case 'Celsius':
                default:
                    return t;
            }
        }




        // Calculate resistance from temperature
        function calculateResistance(t) {
            const R0 = nominalResistance;
            return R0 * (1 + A * t + B * t * t + C * (t - 100) * t * t * t);
        }

        // Calculate dR/dT
        function calculateDrDt(t) {
            const R0 = nominalResistance;
            return R0 * (A + 2 * B * t + 3 * C * (t - 100) * t * t);
        }

        // Perform calculation and display results
        let calculatedTemperature = '-';
        let calculatedResistance = '-';
        let calculatedDrDtValue = '-';

        if (!isNaN(resistanceInput) && resistanceInput !== '') {
            const units = document.getElementById('units').value;
            calculatedTemperature = calculateTemperature(resistanceInput, units).toFixed(2);
        }


        if (!isNaN(temperatureInput) && temperatureInput !== '') {
            calculatedResistance = calculateResistance(temperatureInput).toFixed(2);
            calculatedDrDtValue = calculateDrDt(temperatureInput).toFixed(4);
        }

        // Set results in the DOM
        document.getElementById('calculated-temperature').textContent = calculatedTemperature + ((units === 'Celsius') ? ' °C' : (units === 'Fahrenheit') ? ' °F' : ' K');
        document.getElementById('calculated-resistance').textContent = calculatedResistance + ' Ω';
        document.getElementById('calculated-dr-dt').textContent = calculatedDrDtValue + ' Ω/°C';
    });
});
