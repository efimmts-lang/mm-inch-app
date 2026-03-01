const INCH_IN_MM = 25.4;
const DENOM_MAX = 64;

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function toMixedFraction(x, denomMax = DENOM_MAX) {
    if (!isFinite(x)) return "";

    const sign = x < 0 ? "-" : "";
    x = Math.abs(x);

    const whole = Math.floor(x);
    const frac = x - whole;

    if (frac < 1e-12) return `${sign}${whole}`;

    let bestNum = 0, bestDen = 1, bestErr = Infinity;

    for (let den = 2; den <= denomMax; den++) {
        const num = Math.round(frac * den);
        const err = Math.abs(frac - (num / den));
        if (err < bestErr) {
            bestErr = err;
            bestNum = num;
            bestDen = den;
        }
    }

    const g = gcd(bestNum, bestDen);
    const num = bestNum / g;
    const den = bestDen / g;

    if (num === 0) return `${sign}${whole}`;

    if (whole === 0)
        return `${sign}${num}/${den}`;

    return `${sign}${whole} ${num}/${den}`;
}

function parseInchInput(str) {
    str = str.trim();

    // Если десятичное число
    if (!str.includes("/"))
        return parseFloat(str);

    // Если смешанная дробь (например 1 1/4)
    const parts = str.split(" ");
    if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const fracParts = parts[1].split("/");
        const num = parseFloat(fracParts[0]);
        const den = parseFloat(fracParts[1]);
        return whole + (num / den);
    }

    // Если просто дробь (например 3/8)
    const frac = str.split("/");
    return parseFloat(frac[0]) / parseFloat(frac[1]);
}

function mmToInch() {
    const value = parseFloat(document.getElementById("value").value);
    if (isNaN(value)) return;

    const inch = value / INCH_IN_MM;
    const fraction = toMixedFraction(inch);

    document.getElementById("result").innerText =
        `${inch.toFixed(5)} inch\n≈ ${fraction} inch`;
}

function inchToMm() {
    const input = document.getElementById("value").value;
    const inch = parseInchInput(input);
    if (isNaN(inch)) return;

    const mm = inch * INCH_IN_MM;

    document.getElementById("result").innerText =
        `${mm.toFixed(4)} mm`;
}

function autoConvert() {
    const input = document.getElementById("value").value.trim();

    if (input.includes("/") || input.includes(" "))
        inchToMm();
    else {
        const num = parseFloat(input);
        if (num > 10)
            mmToInch();
        else
            inchToMm();
    }
}