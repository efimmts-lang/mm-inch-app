const INCH_IN_MM = 25.4;
const STEP_DENOMS = [16, 32, 64];

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function normalizeNumberString(s) {
  return (s || "").trim().replace(",", "."); // 1,5 -> 1.5
}

// Выбираем лучшую дробь ТОЛЬКО с знаменателями 16/32/64.
// Возвращаем объект: { whole, num, den, err }
function bestStepFraction(xAbs) {
  const whole = Math.floor(xAbs);
  const frac = xAbs - whole;

  // почти целое
  if (frac < 1e-12) {
    return { whole, num: 0, den: 1, err: 0 };
  }

  let best = null;

  for (const den0 of STEP_DENOMS) {
    let num0 = Math.round(frac * den0);

    // если округлило до целого
    let wholeAdj = whole;
    if (num0 >= den0) {
      wholeAdj += 1;
      num0 = 0;
    }

    // сокращаем дробь
    let num = num0;
    let den = den0;
    if (num !== 0) {
      const g = gcd(num, den);
      num = num / g;
      den = den / g;
    }

    const approx = wholeAdj + (num === 0 ? 0 : num / den);
    const err = Math.abs(xAbs - approx);

    const candidate = { whole: wholeAdj, num, den, err };

    if (!best) best = candidate;
    else {
      // 1) меньше ошибка
      // 2) при равной ошибке — меньше знаменатель (более “простая” дробь)
      const eps = 1e-12;
      if (candidate.err + eps < best.err) best = candidate;
      else if (Math.abs(candidate.err - best.err) <= eps && candidate.den < best.den) best = candidate;
    }
  }

  return best;
}

// Формат: 0 -> "0", 0.5 -> "1/2", 1.25 -> "1 1/4"
function toMixedFractionStep(x) {
  if (!isFinite(x)) return "";

  const sign = x < 0 ? "-" : "";
  const xAbs = Math.abs(x);

  const b = bestStepFraction(xAbs);

  // целое
  if (b.num === 0) return `${sign}${b.whole}`;

  // только дробь
  if (b.whole === 0) return `${sign}${b.num}/${b.den}`;

  // смешанная
  return `${sign}${b.whole} ${b.num}/${b.den}`;
}

function parseInchInput(str) {
  str = (str || "").trim();
  if (!str) return NaN;

  // поддержим формат "1-1/4" (часто так пишут)
  str = str.replace(/\s+/g, " ").replace("-", " ");

  // если есть дробь
  if (str.includes("/")) {
    const parts = str.split(" ");
    // смешанная: "1 1/4"
    if (parts.length === 2) {
      const whole = parseFloat(normalizeNumberString(parts[0]));
      const [n, d] = parts[1].split("/");
      const num = parseFloat(normalizeNumberString(n));
      const den = parseFloat(normalizeNumberString(d));
      if (!isFinite(whole) || !isFinite(num) || !isFinite(den) || den === 0) return NaN;
      return whole + num / den;
    }
    // простая: "3/8"
    const [n, d] = str.split("/");
    const num = parseFloat(normalizeNumberString(n));
    const den = parseFloat(normalizeNumberString(d));
    if (!isFinite(num) || !isFinite(den) || den === 0) return NaN;
    return num / den;
  }

  // десятичная: "1.5" или "1,5"
  return parseFloat(normalizeNumberString(str));
}

function animateResult() {
  const el = document.getElementById("result");
  if (!el) return;
  el.classList.remove("pop");
  // перезапуск анимации
  void el.offsetWidth;
  el.classList.add("pop");
}

function mmToInch() {
  const raw = document.getElementById("value").value;
  const value = parseFloat(normalizeNumberString(raw));
  if (isNaN(value)) return;

  const inch = value / INCH_IN_MM;

  // дробь только 16/32/64
  const fraction = toMixedFractionStep(inch);

  document.getElementById("result").innerText =
    `${inch.toFixed(5)} inch\n≈ ${fraction} inch`;

  animateResult();
}

function inchToMm() {
  const input = document.getElementById("value").value;
  const inch = parseInchInput(input);
  if (isNaN(inch)) return;

  const mm = inch * INCH_IN_MM;

  document.getElementById("result").innerText =
    `${mm.toFixed(4)} mm`;

  animateResult();
}

function autoConvert() {
  const input = document.getElementById("value").value.trim();
  if (!input) return;

  // если есть "/" или пробел — это дюймы (дробь/смешанная)
  if (input.includes("/") || input.includes(" ")) {
    inchToMm();
    return;
  }

  const num = parseFloat(normalizeNumberString(input));
  if (isNaN(num)) return;

  // грубая эвристика: >10 обычно мм, иначе дюймы
  if (num > 10) mmToInch();
  else inchToMm();
}