"""
Cálculo básico de parámetros de calidad eléctrica a partir de un CSV de PicoScope.

Uso:
    python calculo_parametros_pq.py ruta_al_csv.csv

El CSV debe contener al menos una columna de señal. Si contiene dos columnas,
se interpreta la primera como tiempo y la segunda como señal.
"""

from __future__ import annotations

import csv
import math
import sys
from pathlib import Path
from typing import List, Tuple


def parse_float(value: str) -> float | None:
    value = value.strip().replace(",", ".")
    try:
        return float(value)
    except ValueError:
        return None


def read_csv(path: Path) -> Tuple[List[float], List[float]]:
    times: List[float] = []
    values: List[float] = []

    with path.open("r", encoding="utf-8", errors="ignore") as f:
        sample = f.read(2048)
        f.seek(0)
        delimiter = ";" if ";" in sample else ","
        reader = csv.reader(f, delimiter=delimiter)

        for row in reader:
            nums = [x for x in (parse_float(cell) for cell in row) if x is not None]
            if len(nums) >= 2:
                times.append(nums[0])
                values.append(nums[1])
            elif len(nums) == 1:
                times.append(float(len(times)))
                values.append(nums[0])

    return times, values


def rms(values: List[float]) -> float:
    return math.sqrt(sum(x * x for x in values) / len(values)) if values else 0.0


def peak(values: List[float]) -> float:
    return max(abs(x) for x in values) if values else 0.0


def crest_factor(values: List[float]) -> float:
    r = rms(values)
    return peak(values) / r if r else 0.0


def harmonic_projection(values: List[float], fs: float, max_harmonic: int = 15) -> List[Tuple[int, float]]:
    """Estimación sencilla de armónicos por proyección seno/coseno."""
    n = min(len(values), 4096)
    if n < 32:
        return []

    x = values[:n]
    avg = sum(x) / n
    x = [v - avg for v in x]

    result: List[Tuple[int, float]] = []
    for h in range(1, max_harmonic + 1):
        f = 50.0 * h
        re = 0.0
        im = 0.0
        for k, value in enumerate(x):
            theta = 2.0 * math.pi * f * k / fs
            re += value * math.cos(theta)
            im -= value * math.sin(theta)
        amp_peak = (2.0 / n) * math.sqrt(re * re + im * im)
        amp_rms = amp_peak / math.sqrt(2.0)
        result.append((h, amp_rms))
    return result


def thd(harmonics: List[Tuple[int, float]]) -> float:
    if not harmonics or harmonics[0][1] == 0:
        return 0.0
    fundamental = harmonics[0][1]
    rest = sum(value * value for _, value in harmonics[1:])
    return math.sqrt(rest) / fundamental * 100.0


def estimate_fs(times: List[float]) -> float:
    if len(times) < 2:
        return 5000.0
    diffs = [b - a for a, b in zip(times[:-1], times[1:]) if b > a]
    if not diffs:
        return 5000.0
    dt = sum(diffs) / len(diffs)
    return 1.0 / dt if dt > 0 else 5000.0


def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python calculo_parametros_pq.py archivo.csv")
        raise SystemExit(1)

    path = Path(sys.argv[1])
    times, values = read_csv(path)
    fs = estimate_fs(times)
    harmonics = harmonic_projection(values, fs)

    print(f"Archivo: {path}")
    print(f"Muestras: {len(values)}")
    print(f"Frecuencia de muestreo estimada: {fs:.2f} Hz")
    print(f"RMS: {rms(values):.4f}")
    print(f"Pico: {peak(values):.4f}")
    print(f"Factor de cresta: {crest_factor(values):.4f}")
    print(f"THD estimada: {thd(harmonics):.2f} %")
    print("Armónicos:")
    for h, value in harmonics:
        print(f"  {h:02d}º: {value:.4f}")


if __name__ == "__main__":
    main()
