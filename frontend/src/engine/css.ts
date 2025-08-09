export type CSSValue = {
  unit: string;
  value: number;
};

export function parseCSSValue(value: string): CSSValue {
  const match = /^(-?\d*\.?\d+)(px|%)?$/.exec(value.trim());

  if (!match) {
    throw new SyntaxError(`Invalid unit value: ${value}`);
  }

  let unit: string | undefined = match[2];

  if (unit === undefined) {
    unit = "px";
  } else if (unit == "%") {
    unit = "percent";
  }

  return {
    unit: unit,
    value: parseFloat(match[1]),
  };
}
